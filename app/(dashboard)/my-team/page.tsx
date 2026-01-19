import { getOrCreateUser } from "@/lib/user"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { TeamLineup, CaptainSelection, BenchPlayers } from "@/components/my-team/team-lineup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Valid formations (DEF-MID-FWD, GK is always 1)
const VALID_FORMATIONS = [
  { def: 3, mid: 4, fwd: 3, name: '3-4-3' },
  { def: 3, mid: 5, fwd: 2, name: '3-5-2' },
  { def: 4, mid: 3, fwd: 3, name: '4-3-3' },
  { def: 4, mid: 4, fwd: 2, name: '4-4-2' },
  { def: 4, mid: 5, fwd: 1, name: '4-5-1' },
  { def: 5, mid: 3, fwd: 2, name: '5-3-2' },
  { def: 5, mid: 4, fwd: 1, name: '5-4-1' },
]

async function assignFormation(picks: any[], userId: string, leagueId: string) {
  // Count available players by position
  const available = {
    GK: picks.filter(p => p.player.position === 'GK'),
    DEF: picks.filter(p => p.player.position === 'DEF'),
    MID: picks.filter(p => p.player.position === 'MID'),
    FWD: picks.filter(p => p.player.position === 'FWD'),
  }

  // Must have at least 1 GK
  if (available.GK.length === 0) {
    return null
  }

  // Find a valid formation that fits available players
  for (const formation of VALID_FORMATIONS) {
    if (
      available.DEF.length >= formation.def &&
      available.MID.length >= formation.mid &&
      available.FWD.length >= formation.fwd
    ) {
      // Build starting 11
      const starters = [
        ...available.GK.slice(0, 1), // Always 1 GK
        ...available.DEF.slice(0, formation.def),
        ...available.MID.slice(0, formation.mid),
        ...available.FWD.slice(0, formation.fwd),
      ]

      // Remaining players go to bench
      const starterIds = new Set(starters.map(s => s.id))
      const bench = picks.filter(p => !starterIds.has(p.id))

      // Updates the lineup slots to match UI
      await prisma.$transaction([
        // Update starters (lineup slots 1-11)
        ...starters.map((pick, index) => 
          prisma.draftPick.update({
            where: { id: pick.id },
            data: { lineupSlot: index + 1 }
          })
        ),
        // Update bench (lineup slots 12-15)
        ...bench.map((pick, index) => 
          prisma.draftPick.update({
            where: { id: pick.id },
            data: { lineupSlot: 12 + index }
          })
        )
      ])

      return {
        starters,
        bench,
        formation: formation.name
      }
    }
  }

  // Put first 11 as starters if no formation fits
  return {
    starters: picks.slice(0, 11),
    bench: picks.slice(11, 15),
    formation: 'Custom'
  }
}

export default async function MyTeamPage() {
  const user = await getOrCreateUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  if (!user.draftComplete) {
    redirect('/leagues')
  }

  // Get user's primary league
  const userLeague = await prisma.league.findFirst({
    where: {
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } }
      ]
    },
    include: {
      members: {
        where: { userId: user.id }
      }
    }
  })

  if (!userLeague) {
    redirect('/leagues')
  }

  // Get user's draft picks
  const draftPicks = await prisma.draftPick.findMany({
    where: {
      userId: user.id,
      leagueId: userLeague.id
    },
    include: {
      player: true
    },
    orderBy: [
      { pickOrder: 'asc' } // Respect user's lineup preference if set
    ]
  })

  // Assign formation and split starters/bench
  const lineup = await assignFormation(draftPicks, user.id, userLeague.id)

  if (!lineup) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Invalid Squad</h2>
          <p className="text-muted-foreground">
            You need at least 1 goalkeeper to view your team.
          </p>
        </div>
      </div>
    )
  }

  const { starters, bench, formation } = lineup

  // Get captain and vice-captain
  const captain = draftPicks.find(p => p.isCaptain)
  const viceCaptain = draftPicks.find(p => p.isViceCaptain)

  // Calculate total points from starters
  const totalPoints = starters.reduce((sum: number, pick: any) => sum + pick.player.total_points, 0)

  return (
    <div className="flex-1 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{user.teamName || 'My Team'}</h1>
            <p className="text-sm text-muted-foreground">
              Gameweek {userLeague.currentGameweek} • {userLeague.name}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {formation}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card>
          <CardHeader className="pb-2 p-4">
            <CardDescription className="text-xs">Gameweek Points</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{totalPoints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-4">
            <CardDescription className="text-xs">Overall Points</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{user.totalPoints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-4">
            <CardDescription className="text-xs">Overall Rank</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{user.currentRank || '-'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-4">
            <CardDescription className="text-xs">Transfers Left</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">∞</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Lineup - Mobile: Stack, Desktop: Side by side */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Starting 11 */}
        <div className="lg:col-span-2 order-1">
          <TeamLineup 
            starters={starters}
            captain={captain}
            viceCaptain={viceCaptain}
          />
        </div>

        {/* Subs & Captain */}
        <div className="space-y-4 order-2">
          <BenchPlayers bench={bench} />
          
          <CaptainSelection 
            captain={captain}
            viceCaptain={viceCaptain}
            userId={user.id}
            leagueId={userLeague.id}
            starters={starters}
          />
        </div>
      </div>
    </div>
  )
}
