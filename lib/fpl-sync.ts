import prisma from "./db"

export async function syncGameweeks() {
  const res = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/')
  const data = await res.json()

  const gameweeks = data.events as {
    id: number
    deadline_time: string
    finished: boolean
    is_current: boolean
    is_next: boolean
  }[]

  await prisma.$transaction(
    gameweeks.map((gw) =>
      prisma.gameweek.upsert({
        where: { id: gw.id },
        create: {
          id: gw.id,
          deadlineTime: new Date(gw.deadline_time),
          finished: gw.finished,
          isCurrent: gw.is_current,
          isNext: gw.is_next,
        },
        update: {
          deadlineTime: new Date(gw.deadline_time),
          finished: gw.finished,
          isCurrent: gw.is_current,
          isNext: gw.is_next,
        },
      })
    )
  )

  return { success: true, count: gameweeks.length }
}
