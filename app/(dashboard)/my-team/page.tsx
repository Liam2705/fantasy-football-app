import { getOrCreateUser } from "@/lib/user";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import {
  TeamLineup,
  CaptainSelection,
  BenchPlayers,
} from "@/components/my-team/team-lineup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateGameweekPoints } from "@/app/actions/gameweek-actions";

// Position Contraints - min and max number allowed in play per position
const POSITION_CONSTRAINTS = {
  GK: { min: 1, max: 1 },
  DEF: { min: 3, max: 5 },
  MID: { min: 3, max: 5 },
  FWD: { min: 1, max: 3 }
}

function isValidLineup(starters: any[]) {
  const counts = {
    GK: starters.filter(p => p.player.position === 'GK').length,
    DEF: starters.filter(p => p.player.position === 'DEF').length,
    MID: starters.filter(p => p.player.position === 'MID').length,
    FWD: starters.filter(p => p.player.position === 'FWD').length,
  }

  // Must have exactly 11 players
  if (starters.length !== 11) return false

  // Check each position against constraints
  for (const [position, constraint] of Object.entries(POSITION_CONSTRAINTS)) {
    const count = counts[position as keyof typeof counts]
    if (count < constraint.min || count > constraint.max) {
      return false
    }
  }

  return true
}

async function assignFormation(picks: any[], userId: string, leagueId: string) {
  // Count available players by position
  const available = {
    GK: picks.filter((p) => p.player.position === "GK"),
    DEF: picks.filter((p) => p.player.position === "DEF"),
    MID: picks.filter((p) => p.player.position === "MID"),
    FWD: picks.filter((p) => p.player.position === "FWD"),
  };

  // Must have at least 1 GK
  if (available.GK.length === 0) return null

  // Check if lineup is already assigned and valid
  const hasLineupSlots = picks.every(p => p.lineupSlot != null)

  if (hasLineupSlots) {
    const starters = picks.filter(p => p.lineupSlot <= 11).sort((a, b) => a.lineupSlot - b.lineupSlot)
    const bench = picks.filter(p => p.lineupSlot > 11).sort((a, b) => a.lineupSlot - b.lineupSlot)

    if (isValidLineup(starters)) {
      const counts = {
        DEF: starters.filter(p => p.player.position === 'DEF').length,
        MID: starters.filter(p => p.player.position === 'MID').length,
        FWD: starters.filter(p => p.player.position === 'FWD').length,
      }

      return {
        starters,
        bench,
        formation: `${counts.DEF}-${counts.MID}-${counts.FWD}`
      }
    }
  }

  // Auto-assign initial lineup (4-4-2 as default)
  const starters = [
    ...available.GK.slice(0, 1),
    ...available.DEF.slice(0, 4),  // 4 defenders
    ...available.MID.slice(0, 4),  // 4 midfielders
    ...available.FWD.slice(0, 2),  // 2 forwards
  ]

  const starterIds = new Set(starters.map((s) => s.id));
  const bench = picks.filter((p) => !starterIds.has(p.id));

  // Save to database
  await prisma.$transaction([
    // Update starters (lineup slots 1-11)
    ...starters.map((pick, index) =>
      prisma.draftPick.update({
        where: { id: pick.id },
        data: { lineupSlot: index + 1 },
      })
    ),
    // Update bench (lineup slots 12-15)
    ...bench.map((pick, index) =>
      prisma.draftPick.update({
        where: { id: pick.id },
        data: { lineupSlot: 12 + index },
      })
    ),
  ]);

  return {
    starters,
    bench,
    formation: '4-4-2'
  }
}

export default async function MyTeamPage() {
  const user = await getOrCreateUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!user.draftComplete) {
    redirect("/leagues");
  }

  // Get user's primary league
  const userLeague = await prisma.league.findFirst({
    where: {
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
    include: {
      members: {
        where: { userId: user.id },
      },
    },
  });

  if (!userLeague) {
    redirect("/leagues");
  }

  // Get user's draft picks
  const draftPicks = await prisma.draftPick.findMany({
    where: {
      userId: user.id,
      leagueId: userLeague.id,
    },
    include: {
      player: {
        include: {
          gameweekStats: {
            where: { gameweek: userLeague.currentGameweek },
          },
        },
      },
    },
    orderBy: [
      { pickOrder: "asc" }, // Respect user's lineup preference if set
    ],
  });

  // Assign formation and split starters/bench
  const lineup = await assignFormation(draftPicks, user.id, userLeague.id);

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
    );
  }

  const { starters, bench, formation } = lineup;

  // Get captain and vice-captain
  const captain = draftPicks.find((p) => p.isCaptain);
  const viceCaptain = draftPicks.find((p) => p.isViceCaptain);

  // Calculate gameweek points WITH captain multiplier
  const gwPointsResult = await calculateGameweekPoints(
    userLeague.id,
    userLeague.currentGameweek,
    user.id
  );

  const gameweekPoints = gwPointsResult.points;

  const playerPointsMap = new Map<string, number>();
  const allPicks = [...starters, ...bench]
  for (const pick of allPicks) {
    const gameweekData = pick.player.gameweekStats?.[0];
    let points = gameweekData?.points ?? 0;

    // Double for captain
    if (pick.id === captain?.id) {
      const captainPlayed = !gameweekData || gameweekData.minutes > 0;
      if (captainPlayed) {
        points *= 2;
      }
    }
    // Double for vice if captain didn't play
    else if (pick.id === viceCaptain?.id && captain) {
      const captainData = starters.find((s) => s.id === captain.id)?.player
        .gameweekStats?.[0];
      if (captainData && captainData.minutes === 0) {
        points *= 2;
      }
    }

    playerPointsMap.set(pick.id, points);
  }

  return (
    <div className="flex-1 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {user.teamName || "My Team"}
            </h1>
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
            <CardDescription className="text-xs">
              Gameweek Points
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {gameweekPoints}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-4">
            <CardDescription className="text-xs">
              Overall Points
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {user.totalPoints}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-4">
            <CardDescription className="text-xs">Overall Rank</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {user.currentRank || "-"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-4">
            <CardDescription className="text-xs">
              Transfers Left
            </CardDescription>
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
            bench={bench}
            leagueId={userLeague.id}
            playerPoints={playerPointsMap}
          />
        </div>

        {/* Subs & Captain */}
        <div className="space-y-4 order-2">
          <BenchPlayers
            bench={bench}
            starters={starters}
            leagueId={userLeague.id}
            playerPoints={playerPointsMap}
            isLocked={userLeague.isGameweekLocked}
          />

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
  );
}
