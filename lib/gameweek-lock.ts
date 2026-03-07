import prisma from '@/lib/db'

export async function lockAllLeagues() {
  await prisma.league.updateMany({
    data: { isGameweekLocked: true },
  })

  return { success: true }
}

export async function unlockAllLeagues() {
  await prisma.league.updateMany({
    data: { isGameweekLocked: false },
  })

  return { success: true }
}

export async function getGameweekLockStatus() {
  const now = new Date()

  const currentGameweek = await prisma.gameweek.findFirst({
    where: { isCurrent: true },
  })

  const nextGameweek = await prisma.gameweek.findFirst({
    where: { isNext: true },
  })

  const deadline = nextGameweek?.deadlineTime ?? currentGameweek?.deadlineTime

  return {
    isLocked: deadline ? now >= deadline : false,
    deadline,
    currentGameweek: currentGameweek?.id ?? null,
    nextGameweek: nextGameweek?.id ?? null,
  }
}
