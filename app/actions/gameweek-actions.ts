'use server'

import { getOrCreateUser } from "@/lib/user"
import { calculateGameweekPointsForUser } from "@/lib/scoring"

export async function calculateGameweekPoints(
  leagueId: string,
  gameweek: number,
  userId: string
): Promise<{ success: boolean; points: number; error?: string }> {
  const user = await getOrCreateUser()
  if (!user) {
    return { success: false, error: 'Unauthorised', points: 0 }
  }

  // Calling the scoring lib function with an authenticated user's id
  return calculateGameweekPointsForUser(user.id, leagueId, gameweek)
}