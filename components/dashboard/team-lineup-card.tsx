import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeamLineupCardProps {
  captain: string;
  viceCaptain: string;
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
  starters,
  bench,
}: TeamLineupCardProps) {
  return (
    <Card className="w-full col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Last Team Selection</CardTitle>
            <CardDescription>Current gameweek lineup (GW 22)</CardDescription>
          </div>
          <Badge variant="secondary">Set Lineup</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Starting XI */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            Starting XI (11)
            <Badge variant="outline" className="text-xs">
              85 pts
            </Badge>
          </h3>
          <div className="space-y-2">
            {starters.map((player, index) => (
              <div
                key={player.name}
                className="flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors group"
              >
                {/* Position badge - smaller on mobile */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                  {player.position}
                </div>

                {/* Player info - truncate properly */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="font-medium text-sm truncate">
                    {player.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {player.team}
                  </div>
                </div>

                {/* Points - right-aligned, smaller font */}
                <div
                  className={`ml-auto text-sm font-medium px-2 py-px rounded-full text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                    player.points > 0
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
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                FWD
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
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                MID
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{viceCaptain}</div>
                <div className="text-xs opacity-90">x1.5 points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bench */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            Bench (4)
            <Badge variant="outline" className="text-xs">
              0 pts
            </Badge>
          </h3>
          <div className="space-y-2">
            {bench.map((player) => (
              <div
                key={player.name}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {player.position}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{player.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {player.team}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-500 text-xs">
                  {player.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button className="w-full sm:w-auto">Edit Lineup</Button>
          <Button variant="outline" className="w-full sm:w-auto">
            Make Transfers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
