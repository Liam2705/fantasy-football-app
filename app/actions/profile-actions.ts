'use server'

import { updateUserProfile } from '@/lib/profile';
import { getOrCreateUser } from '@/lib/user'


export async function updateProfileAction(data: {
  teamName: string
  username: string
}): Promise<{ success: boolean; error?: string }> {
  const user = await getOrCreateUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  try {
    await updateUserProfile(user.id, data)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong.'
    return { success: false, error: message }
  }
}
