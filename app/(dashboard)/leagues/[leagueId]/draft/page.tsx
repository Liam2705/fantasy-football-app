import { getOrCreateUser } from "@/lib/user"
import prisma from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { PlayerList } from "@/components/draft/player-list"
import { SelectedSquad } from "@/components/draft/selected-squad"

export default async function LeagueDraftPage({
  params
}: {
  params: Promise<{ leagueId: string }>
}) {
  const user = await getOrCreateUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Await params
  const { leagueId } = await params

  // Check if user is a member of this league
  const membership = await prisma.leagueMember.findFirst({
    where: {
      leagueId,
      userId: user.id
    },
    include: {
      league: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    }
  })

  // If not a member, redirect to leagues page
  if (!membership) {
    redirect('/leagues')
  }

  // If user already completed draft, redirect to my-team
  if (user.draftComplete) {
    redirect('/my-team')
  }

  // Get available players for THIS league only
  const players = await prisma.player.findMany({
    where: {
      NOT: {
        draftPicks: {
          some: { 
            leagueId // Only show players not drafted in this league
          }
        }
      }
    },
    orderBy: { total_points: 'desc' }
  })

  // Get user's current draft picks for THIS league
  const draftPicks = await prisma.draftPick.findMany({
    where: { 
      userId: user.id,
      leagueId
    },
    include: { player: true },
    orderBy: { pickOrder: 'asc' }
  })

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Build Your Squad</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Select 15 players: 2 GK, 5 DEF, 5 MID, 3 FWD
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          League: <span className="font-semibold">{membership.league.name}</span> ({membership.league.code})
        </p>
        <p className="text-xs text-red-500 mt-1">
        </p>
      </div>

      <div className="space-y-4 lg:space-y-0 lg:grid lg:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 lg:order-2">
          <SelectedSquad picks={draftPicks} userId={user.id} leagueId={leagueId} />
        </div>

        <div className="lg:col-span-2 lg:order-1">
          <PlayerList players={players} currentPicks={draftPicks} leagueId={leagueId} />
        </div>
      </div>
    </div>
  )
}
