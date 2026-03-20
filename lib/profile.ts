import prisma from '@/lib/db'

export async function updateUserProfile(
  userId: string,
  data: { teamName: string; username: string },
) {
  const { teamName, username } = data

  const trimmedUsername = username.trim().toLowerCase()
  const trimmedTeamName = teamName.trim()

  if (!trimmedUsername) throw new Error('Username cannot be empty.')
  if (!trimmedTeamName) throw new Error('Team name cannot be empty.')

  // Checks if the username is unique not with current userId
  const existing = await prisma.user.findFirst({
    where: {
      username: trimmedUsername,
      NOT: { id: userId },
    },
  })

  if (existing) throw new Error('That username is already taken.')

  await prisma.user.update({
    where: { id: userId },
    data: {
      username: trimmedUsername,
      teamName: trimmedTeamName,
    },
  })
}
