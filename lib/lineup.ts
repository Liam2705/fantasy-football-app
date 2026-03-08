export const POSITION_CONSTRAINTS = {
  GK: { min: 1, max: 1 },
  DEF: { min: 3, max: 5 },
  MID: { min: 3, max: 5 },
  FWD: { min: 1, max: 3 },
}

export function isValidLineup(starters: { player: { position: string } }[]) {
  const counts = {
    GK: starters.filter(p => p.player.position === 'GK').length,
    DEF: starters.filter(p => p.player.position === 'DEF').length,
    MID: starters.filter(p => p.player.position === 'MID').length,
    FWD: starters.filter(p => p.player.position === 'FWD').length,
  }

  if (starters.length !== 11) return false

  for (const [position, constraint] of Object.entries(POSITION_CONSTRAINTS)) {
    const count = counts[position as keyof typeof counts]
    if (count < constraint.min || count > constraint.max) return false
  }

  return true
}

