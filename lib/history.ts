import prisma from "./db"


export type GameweekHistoryRow = {
  gameweek: number
  points: number
  rank: number | null
  autosubs: AutoSubEntry[]
}

type AutoSubEntry = {
  playerOut: string
  playerIn: string
}

export async function getGameweekHistory(
  userId: string,
  leagueId: string,
): Promise<GameweekHistoryRow[]> {
    
  const membership = await prisma.leagueMember.findUnique({
    where: { userId },
    select: { leagueId: true },
  })

  if (!membership || membership.leagueId !== leagueId) {
    throw new Error('Not a member of this league.')
  }

  const records = await prisma.userGameweek.findMany({
    where: { userId, leagueId },
    orderBy: { gameweek: 'asc' },
  })

  return records.map(record => ({
    gameweek: record.gameweek,
    points: record.points,
    rank: record.rank ?? null,
    autosubs: parseAutosubs(record.autosubs),
  }))
}

function parseAutosubs(raw: unknown): AutoSubEntry[] {
  if (!raw || !Array.isArray(raw)) return []
  return raw
    .filter(
      (entry): entry is { playerOut: string; playerIn: string } =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof entry.playerOut === 'string' &&
        typeof entry.playerIn === 'string',
    )
    .map(entry => ({ playerOut: entry.playerOut, playerIn: entry.playerIn }))
}
