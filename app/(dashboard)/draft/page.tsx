import { getOrCreateUser } from "@/lib/user"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { PlayerList } from "@/components/draft/player-list"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SelectedSquad } from "@/components/draft/selected-squad"

export default async function DraftPage() {
  const user = await getOrCreateUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Get all available players
  const players = await prisma.player.findMany({
    where: { isDrafted: false },
    orderBy: { total_points: 'desc' }
  })

  // Get user's current draft picks
  const draftPicks = await prisma.draftPick.findMany({
    where: { userId: user.id },
    include: { player: true },
    orderBy: { pickOrder: 'asc' }
  })

  return (
    <>
      {/* <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="h-6 mr-2" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Draft Your Team</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header> */}

      <div className="flex-1 p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Build Your Squad</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Select 15 players: 2 GK, 5 DEF, 5 MID, 3 FWD
          </p>
        </div>

        {/* Mobile - Squad at top, Players below */}
        <div className="space-y-4 lg:space-y-0 lg:grid lg:gap-6 lg:grid-cols-3">
          {/* Selected squad shows first on mobile */}
          <div className="lg:col-span-1 lg:order-2">
            <SelectedSquad picks={draftPicks} userId={user.id} />
          </div>

          {/* Player pool shows second on mobile */}
          <div className="lg:col-span-2 lg:order-1">
            <PlayerList players={players} currentPicks={draftPicks} />
          </div>
        </div>
      </div>
    </>
  )
}
