import { GameweekPointsCard } from "@/components/dashboard/gameweek-points-card";
import { OverallRankCard } from "@/components/dashboard/overall-rank-card";
import { TeamLineupCard } from "@/components/dashboard/team-lineup-card";
import { TransfersCard } from "@/components/dashboard/transfers-card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import prisma from "@/lib/db";
import { getOrCreateUser } from "@/lib/user";
import { redirect } from "next/navigation";

export default async function Page() {

  const user = await getOrCreateUser()
  if (!user) redirect('/sign-in')

  const membership = await prisma.leagueMember.findUnique({
    where: { userId: user.id },
    include: { league: true },
  })

  // Fetch squad if user has a league and draft is complete
  const draftPicks = membership && user.draftComplete
    ? await prisma.draftPick.findMany({
      where: { userId: user.id, leagueId: membership.league.id },
      include: { player: true },
      orderBy: { lineupSlot: 'asc' },
    })
    : []

  const currentGameweek = await prisma.gameweek.findFirst({
    where: { isCurrent: true },
  })

  const gwPoints = currentGameweek
    ? await prisma.playerGameweek.findMany({
      where: {
        playerId: { in: draftPicks.map(p => p.playerId) },
        gameweek: currentGameweek.id,
      },
    })
    : []

  const pointsMap = new Map(gwPoints.map(gw => [gw.playerId, gw.points]))

  const starters = draftPicks
    .filter(p => p.lineupSlot <= 11)
    .map(p => ({
      name: p.player.web_name,
      team: p.player.team_short_name,
      position: p.player.position,
      points: pointsMap.get(p.playerId) ?? 0,
    }))

  const bench = draftPicks
    .filter(p => p.lineupSlot > 11)
    .map(p => ({
      name: p.player.web_name,
      team: p.player.team_short_name,
      position: p.player.position,
      points: pointsMap.get(p.playerId) ?? 0,
    }))

  const captainPick = draftPicks.find(p => p.isCaptain)
  const viceCaptainPick = draftPicks.find(p => p.isViceCaptain)

  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <GameweekPointsCard
              gameweek={22}
              points={34}
              change={12}
              progress={76}
            />
            <OverallRankCard rank={0} change={0} />
            <TransfersCard transfers={0} freeTransfers={0} />
          </div>
          <TeamLineupCard
            captain={captainPick?.player.web_name ?? ''}
            viceCaptain={viceCaptainPick?.player.web_name ?? ''}
            starters={starters}
            bench={bench} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
