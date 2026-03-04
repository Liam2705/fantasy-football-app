'use server'

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

const POSITION_CONSTRAINTS = {
    GK: { min: 1, max: 1 },
    DEF: { min: 3, max: 5 },
    MID: { min: 3, max: 5 },
    FWD: { min: 1, max: 3 }
}

interface SubstitutionLog {
    starterOut: string
    benchIn: string
    reason: string
}

export async function processAutoSubs(
    userId: string,
    leagueId: string,
    gameweek: number
) {
    try {
        // Get all picks for this user and league with gameweek data
        const allPicks = await prisma.draftPick.findMany({
            where: {
                userId,
                leagueId
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

        // Split into starters and bench
        let starters = allPicks.filter(p => p.lineupSlot <= 11)
        let bench = allPicks.filter(p => p.lineupSlot > 11).sort((a, b) => a.lineupSlot - b.lineupSlot)

        const substitutions: SubstitutionLog[] = []

        // Check each starter for 0 minutes
        for (let i = 0; i < starters.length; i++) {
            const starter = starters[i]
            const gameweekData = starter.player.gameweekStats[0]

            // If no gameweek data, assume they played
            const minutes = gameweekData?.minutes ?? 90

            if (minutes === 0) {
                const starterPoints = gameweekData?.points ?? 0

                // Try to find best substitute from bench
                const substitute = findEligibleSub(starter, bench, starters)

                if (substitute) {
                    const subData = substitute.player.gameweekStats[0]
                    const subPoints = subData?.points ?? substitute.player.total_points



                    // Perform the swap
                    starters[i] = substitute
                    bench = bench.filter(p => p.id !== substitute.id)
                    bench.push(starter)

                    substitutions.push({
                        starterOut: `${starter.player.web_name} (${starterPoints} pts)`,
                        benchIn: `${substitute.player.web_name} (${subPoints} pts)`,
                        reason: 'Did not play'
                    })
                }
            }
        }


        // Save substitutions to database if any were made
        if (substitutions.length > 0) {

            await prisma.$transaction([
                // Update starters (slots 1-11)
                ...starters.map((pick, index) =>
                    prisma.draftPick.update({
                        where: { id: pick.id },
                        data: { lineupSlot: index + 1 }
                    })
                ),
                // Update bench (slots 12-15)
                ...bench.map((pick, index) =>
                    prisma.draftPick.update({
                        where: { id: pick.id },
                        data: { lineupSlot: 12 + index }
                    })
                )
            ])


        }
        revalidatePath('/my-team')

        return {
            success: true,
            substitutions,
            message: `Processed ${substitutions.length} substitution(s)`
        }
    } catch (error) {
        return {
            success: false,
            substitutions: [],
            error: 'Failed to process auto-subs'
        }
    }
}

// Find the best substitute (highest points) that maintains formation validity
function findEligibleSub(
    starter: any,
    bench: any[],
    currentStarters: any[]
) {
    const starterPosition = starter.player.position

    // Get all eligible bench players with their points
    const eligibleSubs: Array<{ pick: any; points: number }> = []

    for (const benchPlayer of bench) {
        const benchData = benchPlayer.player.gameweekStats[0]
        const benchMinutes = benchData?.minutes ?? 90

        //Skip players who didn't play
        if (benchMinutes === 0) continue

        const benchPoints = benchData?.points ?? benchPlayer.player.total_points

        // Try same position first (always valid formation)
        if (benchPlayer.player.position === starterPosition) {
            eligibleSubs.push({ pick: benchPlayer, points: benchPoints })
            continue
        }

        // Try different position - check if formation stays valid
        const testStarters = currentStarters.map(s =>
            s.id === starter.id ? benchPlayer : s
        )

        if (isValidFormation(testStarters)) {
            eligibleSubs.push({ pick: benchPlayer, points: benchPoints })
        }
    }

    // Sort by points (highest first)
    eligibleSubs.sort((a, b) => b.points - a.points)

    if (eligibleSubs.length > 0) {
        const best = eligibleSubs[0]
        return best.pick
    }

    return null // No valid sub found
}


// Check if a lineup maintains a valid formation
function isValidFormation(starters: any[]) {
    const counts = {
        GK: starters.filter(p => p.player.position === 'GK').length,
        DEF: starters.filter(p => p.player.position === 'DEF').length,
        MID: starters.filter(p => p.player.position === 'MID').length,
        FWD: starters.filter(p => p.player.position === 'FWD').length,
    }

    if (starters.length !== 11) return false

    for (const [position, constraint] of Object.entries(POSITION_CONSTRAINTS)) {
        const count = counts[position as keyof typeof counts]
        if (count < constraint.min || count > constraint.max) {
            return false
        }
    }

    return true
}