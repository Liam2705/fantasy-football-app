import { DraftPick, Player } from "@/app/generated/prisma/client"

const positionOrder: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 }

export function sortPlayersByPosition(
  picks: (DraftPick & { player: Player })[]
): (DraftPick & { player: Player })[] {
  return [...picks].sort((a, b) => {
    const posDiff = (positionOrder[a.player.position] ?? 99) - (positionOrder[b.player.position] ?? 99)
    if (posDiff !== 0) return posDiff
    return a.lineupSlot - b.lineupSlot
  })
}
