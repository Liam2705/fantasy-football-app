'use server'

import { getOrCreateUser } from '@/lib/user'
import { executeTransfer } from '@/lib/transfers'

export async function executeTransferAction(
  leagueId: string,
  outgoingPlayerId: string,
  incomingPlayerId: string
) {
  const user = await getOrCreateUser()

  if (!user) {
    return { success: false, error: 'Unauthorised' }
  }

  return executeTransfer(user.id, leagueId, outgoingPlayerId, incomingPlayerId)
}
