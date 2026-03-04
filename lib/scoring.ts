import prisma from "@/lib/db"

export async function calculateGameweekPointsForUser(
    userId: string,
    leagueId: string,
    gameweek: number
): Promise<{ success: boolean; points: number; error?: string }> {
    try {
        const picks = await prisma.draftPick.findMany({
            where: {
                userId,
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

        for (const pick of picks) {
            const gameweekData = pick.player.gameweekStats[0]
            let playerPoints = gameweekData?.points ?? 0

            if (pick.isCaptain) {
                const captainPlayed = !gameweekData || gameweekData.minutes > 0
                if (captainPlayed) {
                    playerPoints *= 2
                }
            } else if (pick.isViceCaptain && captain) {
                const captainStats = picks.find(p => p.isCaptain)?.player.gameweekStats[0]
                if (captainStats && captainStats.minutes === 0) {
                    playerPoints *= 2
                }
            }

            totalPoints += playerPoints
        }

        return { success: true, points: totalPoints }

    } catch (error) {
        console.error('Calculate Points error: ', error)
        return {
            success: false,
            error: 'Failed to calculate gameweek points.',
            points: 0
        }
    }
}
