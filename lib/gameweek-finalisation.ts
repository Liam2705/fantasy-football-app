import { processAutoSubs } from "@/app/actions/auto-sub-actions"
import { calculateGameweekPoints } from "@/app/actions/gameweek-actions"
import prisma from "@/lib/db"
import { calculateGameweekPointsForUser } from "./scoring"

interface MemberResult {
    userId: string,
    points: number,
    autoSubs: object
}

export async function finaliseGameweek(leagueId: string, gameweek: number) {
    // Lock the league
    await prisma.league.update({
        where: { id: leagueId },
        data: { isGameweekLocked: true }
    })

    try {
        // Get all users from the league
        const members = await prisma.leagueMember.findMany({
            where: { leagueId }
        })

        // Process each member
        const results: MemberResult[] = []

        for (const member of members) {
            /* 
            Run autosubs first so the points are calculated on
            an updated lineup 
            */
            const autoSubsResult = await processAutoSubs(
                member.userId,
                leagueId,
                gameweek
            )

            // Then calculate gameweek points
            const gameweekPointsResult = await calculateGameweekPointsForUser(
                member.userId,
                leagueId,
                gameweek,
                

            )

            // Push to the results array
            results.push({
                userId: member.userId,
                points: gameweekPointsResult.points,
                autoSubs: autoSubsResult.substitutions
            })
        }

            // Sort by points descending and assign gameweek ranks
            const ranked = results
                .sort((a, b) => b.points - a.points)
                .map((result, index) => ({
                    ...result,
                    rank: index + 1
                }))

            // Upsert all UserGameweek records in a single transaction
            await prisma.$transaction(
                ranked.map((result) =>
                    prisma.userGameweek.upsert({
                        where: {
                            userId_leagueId_gameweek: {
                                userId: result.userId,
                                leagueId,
                                gameweek
                            }
                        },
                        create: {
                            userId: result.userId,
                            leagueId,
                            gameweek,
                            points: result.points,
                            autosubs: result.autoSubs,
                            rank: result.rank
                        },
                        update: {
                            points: result.points,
                            autosubs: result.autoSubs,
                            rank: result.rank
                        }
                    }))
            )

            await prisma.league.update({
                where: { id: leagueId },
                data: {
                    isGameweekLocked: false,
                    lastFinalised: gameweek
                }
            })

            return { success: true, processed: ranked.length }

    } catch (error) {
        // Unlock the league if something fails
        await prisma.league.update({
            where: { id: leagueId },
            data: { isGameweekLocked: false }
        })

        console.log(`Finalisation failed for league ${leagueId}: `, error);

    }
}