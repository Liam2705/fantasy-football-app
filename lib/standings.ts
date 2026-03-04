import prisma from "./db"


export type StandingsEntry ={
  rank: number
  userId: string
  username: string | null
  teamName: string | null
  totalPoints: number
  gameweekPoints: number
}

export async function getLeagueStandings(leagueId: string): Promise<StandingsEntry[]> {

  // Get the league, it's users, and all the user's gameweeks
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              teamName: true,
            }
          }
        }
      },
      userGameweeks: {
        where: { leagueId }
      }
    }
  })

  if (!league) return []

  const lastFinalisedGameweek = league.lastFinalised ?? 0

  const entries: StandingsEntry[] = league.members.map((member) => {
    // Filters and retrieves the gameweek rows for this user
    const userGwRows = league.userGameweeks.filter((gw) => gw.userId === member.userId)

    // Sum every finalised gameweek to get totalPoints
    const totalPoints = userGwRows.reduce((sum, gw) => sum + gw.points, 0)

    // Get the points from the latest finalised gameweek
    const latestGwRow = userGwRows.find((gw) => gw.gameweek === lastFinalisedGameweek)
    const gameweekPoints = latestGwRow?.points ?? 0

    return {
      rank: 0, // Placeholder value - assigned after sorting
      userId: member.userId,
      username: member.user.username,
      teamName: member.user.teamName,
      totalPoints,
      gameweekPoints
    }
  })

  entries.sort((a, b) => b.totalPoints - a.totalPoints)

  // Assign ranks - if two users are tied they share ranks
  let currentRank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].totalPoints < entries[i - 1].totalPoints) {
      currentRank = i + 1
    }
    entries[i].rank = currentRank
  }

  return entries
}