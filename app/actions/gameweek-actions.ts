'use server'

import { Prisma } from "../generated/prisma/client"
import prisma from "@/lib/db"
import { getOrCreateUser } from "@/lib/user"

export async function calculateGameweekPoints(leagueId: string, gameweek: number): Promise<{ success: boolean; points: number; error?: string }> {

    try {
        // User validation
        const user = await getOrCreateUser();
        if (!user) {
            return {
                success: false,
                error: 'Unauthorised',
                points: 0
            }
        }

        const picks = await prisma.draftPick.findMany({
            where: {
                userId: user.id,
                leagueId,
                lineupSlot: { lte: 11 }
            },
            include: {
                player: {
                    include: {
                        gameweekStats: {
                            where: { gameweek }
                        }
                    }
                }
            },
            orderBy: { lineupSlot: 'asc' }
        })

        let totalPoints = 0
        const captain = picks.find(p => p.isCaptain)
        const viceCaptain = picks.find(p => p.isViceCaptain)

        for (const pick of picks) {
            const gameweekData = pick.player.gameweekStats[0]
            let playerPoints = gameweekData?.points ?? pick.player.total_points

            // Captain logic: double points if captain played
            if (pick.isCaptain) {
                const captainPlayed = !gameweekData || gameweekData.minutes > 0
                if (captainPlayed) {
                    playerPoints *= 2
                }
            }
            // Vice-captain: gets double if captain didn't play
            else if (pick.isViceCaptain && captain) {
                const captainStats = picks.find(p => p.isCaptain)?.player.gameweekStats[0]
                if (captainStats && captainStats.minutes === 0) {
                    playerPoints *= 2
                }
            }

            totalPoints += playerPoints
        }


        return { success: true, points: totalPoints }

    } catch (error) {
        console.error('Calculate Points error: ', error);
        return {
            success: false,
            error: 'Failed to calculate gameweek points, please try again.',
            points: 0
        }

    }


}