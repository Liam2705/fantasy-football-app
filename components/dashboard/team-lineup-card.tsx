import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { redirect } from "next/dist/server/api-utils";
import Link from "next/link";
import { sortPlayersByPosition } from "@/lib/sort-players";

const getPositionStyle = (position: string) => {
  switch (position) {
    case 'GK': return 'bg-blue-500'
    case 'DEF': return 'bg-green-500'
    case 'MID': return 'bg-yellow-500'
    case 'FWD': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

interface TeamLineupCardProps {
  captain: string;
  viceCaptain: string;
  gameweek: number | null
  starters: Array<{
    name: string;
    team: string;
    position: string;
    points: number;
  }>;
  bench: Array<{
    name: string;
    team: string;
    position: string;
    points: number;
  }>;
}

export function TeamLineupCard({
  captain,
  viceCaptain,
  gameweek,
  starters,
  bench,
}: TeamLineupCardProps) {

  const starterPoints = starters.reduce((sum, p) => {
    const multiplier = p.name === captain ? 2 : 1
    return sum + p.points * multiplier
  }, 0)
  const benchPoints = bench.reduce((sum, p) => sum + p.points, 0)

  const POSITION_ORDER: Record<string, number> = {
    GK: 0,
    DEF: 1,
    MID: 2,
    FWD: 3,
  }

  const sortedBench = [...bench].sort(
    (a, b) => POSITION_ORDER[a.position] - POSITION_ORDER[b.position]
  )

  const formation = starters.length === 11
  ? `${starters.filter(p => p.position === 'DEF').length}-${starters.filter(p => p.position === 'MID').length}-${starters.filter(p => p.position === 'FWD').length}`
  : null

  return (
    <Card className="w-full col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Last Team Selection</CardTitle>
            <CardDescription>Current gameweek lineup (GW {gameweek})</CardDescription>
          </div>
          <Badge variant="secondary">{formation ?? 'Set Lineup'}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Starting XI */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            Starting XI (11)
            <Badge variant="outline" className="text-xs">
              {starterPoints} pts
            </Badge>
          </h3>
          <div className="space-y-2">
            {starters.map((player, index) => (
              <div
                key={player.name}
                className="flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors group"
              >
                {/* Position badge */}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${getPositionStyle(player.position)} rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0`}>
                  {player.position}
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="font-medium text-sm truncate">
                    {player.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {player.team}
                  </div>
                </div>

                {/* Points */}
                <div
                  className={`ml-auto font-medium px-2 py-px rounded-full text-xs sm:text-sm whitespace-nowrap shrink-0 ${player.points > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {player.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Captain & Vice-Captain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">
              Captain
            </h4>
            <div className="flex items-center gap-3 p-4 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-xl">
              <div className={`w-12 h-12 ${getPositionStyle(starters.find(p => p.name === captain)?.position ?? '')} bg-purple-400 rounded-full flex items-center justify-center text-white font-bold text-s`}>
                {starters.find(p => p.name === captain)?.position ?? '—'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{captain}</div>
                <div className="text-xs opacity-90">x2 points</div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">
              Vice-Captain
            </h4>
            <div className="flex items-center gap-3 p-4 bg-linear-to-r from-indigo-500 to-indigo-600 text-white rounded-xl">
              <div className={`w-12 h-12 ${getPositionStyle(starters.find(p => p.name === viceCaptain)?.position ?? '')} bg-indigo-400 rounded-full flex items-center justify-center text-white font-bold text-s`}>
                {starters.find(p => p.name === viceCaptain)?.position ?? '—'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{viceCaptain}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bench */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            Bench (4)
            <Badge variant="outline" className="text-xs">
              {benchPoints} pts
            </Badge>
          </h3>
          <div className="space-y-2">
            {sortedBench.map((player) => (
              <div
                key={player.name}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className={`w-10 h-10 ${getPositionStyle(player.position)} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                  {player.position}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{player.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {player.team}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {player.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button className="w-full sm:w-auto">
            <Link href="/my-team">Edit Lineup</Link>
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Link href="/transfers">Make Transfers</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
