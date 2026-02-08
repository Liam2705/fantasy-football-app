"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DraftPick, Player } from "@/app/generated/prisma/client";
import { ArrowDownUp, Shield, Star } from "lucide-react";
import { CaptainDialog } from "./captain-dialog";
import { useState } from "react";
import { SwapDialog } from "./swap-dialog";

type TeamLineupProps = {
  starters: (DraftPick & { player: Player })[];
  captain: (DraftPick & { player: Player }) | undefined;
  viceCaptain: (DraftPick & { player: Player }) | undefined;
  bench: (DraftPick & { player: Player })[];
  leagueId: string;
  playerPoints?: Map<string, number>
};

export function TeamLineup({
  starters,
  captain,
  viceCaptain,
  bench,
  leagueId,
  playerPoints
}: TeamLineupProps) {


  

  // Group starters by position
  const lineup = {
    GK: starters.filter((p) => p.player.position === "GK"),
    DEF: starters.filter((p) => p.player.position === "DEF"),
    MID: starters.filter((p) => p.player.position === "MID"),
    FWD: starters.filter((p) => p.player.position === "FWD"),
  };

  const getPositionColor = (pos: string) => {
    switch (pos) {
      case "GK":
        return "bg-blue-500";
      case "DEF":
        return "bg-green-500";
      case "MID":
        return "bg-yellow-500";
      case "FWD":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const PlayerCard = ({ pick }: { pick: DraftPick & { player: Player } }) => {
    const isCaptain = pick.id === captain?.id;
    const isViceCaptain = pick.id === viceCaptain?.id;
    const displayPoints = playerPoints?.get(pick.id) ?? pick.player.total_points;
  

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative group">
          <div
            className={`${getPositionColor(pick.player.position)} text-white rounded-lg p-2 shadow-md w-16 sm:w-20 transition-all`}
          >
            <div className="text-center">
              <div className="text-xs font-bold truncate px-1">
                {pick.player.lastName}
              </div>
              <div className="text-[10px] opacity-90 truncate">
                {pick.player.team_short_name}
              </div>
              <div className={`text-base sm:text-lg font-bold mt-0.5 ${isCaptain ? 'text-yellow-300' : ''}`}>
                {displayPoints}
              </div>
            </div>
          </div>

          {isCaptain && (
            <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
              C
            </div>
          )}
          {isViceCaptain && (
            <div className="absolute -top-1 -right-1 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
              V
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Starting XI</CardTitle>
          <div className="text-xs text-muted-foreground">
            {lineup.DEF.length}-{lineup.MID.length}-{lineup.FWD.length}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {/* Football Pitch Layout */}
        <div className="bg-gradient-to-b from-green-600 to-green-700 rounded-lg p-3 sm:p-6 min-h-[600px] sm:min-h-[700px] flex flex-col justify-between">
          {/* Goalkeeper */}
          {lineup.GK.length > 0 && (
            <div className="flex justify-center">
              <div className="flex gap-3 sm:gap-4">
                {lineup.GK.map((pick) => (
                  <PlayerCard key={pick.id} pick={pick} />
                ))}
              </div>
            </div>
          )}

          {/* Defenders */}
          {lineup.DEF.length > 0 && (
            <div className="flex justify-center">
              <div className="flex gap-2 sm:gap-3 flex-wrap justify-center max-w-full">
                {lineup.DEF.map((pick) => (
                  <PlayerCard key={pick.id} pick={pick} />
                ))}
              </div>
            </div>
          )}

          {/* Midfielders */}
          {lineup.MID.length > 0 && (
            <div className="flex justify-center">
              <div className="flex gap-2 sm:gap-3 flex-wrap justify-center max-w-full">
                {lineup.MID.map((pick) => (
                  <PlayerCard key={pick.id} pick={pick} />
                ))}
              </div>
            </div>
          )}

          {/* Forwards */}
          {lineup.FWD.length > 0 && (
            <div className="flex justify-center">
              <div className="flex gap-2 sm:gap-3 flex-wrap justify-center max-w-full">
                {lineup.FWD.map((pick) => (
                  <PlayerCard key={pick.id} pick={pick} />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Captain Selection Component
export function CaptainSelection({
  captain,
  viceCaptain,
  userId,
  leagueId,
  starters,
}: {
  captain: (DraftPick & { player: Player }) | undefined;
  viceCaptain: (DraftPick & { player: Player }) | undefined;
  userId: string;
  leagueId: string;
  starters: (DraftPick & { player: Player })[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Captain & Vice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Captain (2x points)
          </div>
          {captain ? (
            <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {captain.player.web_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {captain.player.position}
                </div>
              </div>
              <CaptainDialog
                starters={starters}
                currentCaptain={captain}
                currentViceCaptain={viceCaptain}
                type="captain"
                leagueId={leagueId}
              />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-lg text-center">
              No captain selected
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Vice-Captain</div>
          {viceCaptain ? (
            <div className="flex items-center gap-2 p-2 bg-muted/50 border rounded-lg">
              <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {viceCaptain.player.web_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {viceCaptain.player.position}
                </div>
              </div>
              <CaptainDialog
                starters={starters}
                currentCaptain={captain}
                currentViceCaptain={viceCaptain}
                type="vice-captain"
                leagueId={leagueId}
              />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-lg text-center">
              No vice-captain selected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Subs Bench Component
export function BenchPlayers({
  bench,
  starters,
  leagueId,
}: {
  bench: (DraftPick & { player: Player })[];
  starters: (DraftPick & { player: Player })[];
  leagueId: string;
}) {
  const [swapPlayerId, setSwapPlayerId] = useState<string | null>(null);

  const selectedPlayer = bench.find((p) => p.id === swapPlayerId);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Substitutes</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {bench.map((pick, index) => (
              <div
                key={pick.id}
                className="flex items-center gap-2 p-2 border rounded-lg"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-muted rounded flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </div>
                <Badge variant="outline" className="flex-shrink-0 text-xs">
                  {pick.player.position}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {pick.player.web_name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {pick.player.team_short_name}
                  </div>
                </div>
                <div className="text-sm font-bold flex-shrink-0">
                  {pick.player.total_points}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => setSwapPlayerId(pick.id)}
                >
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {bench.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6">
                No substitutes
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedPlayer && (
        <SwapDialog
          benchPlayer={selectedPlayer}
          starters={starters}
          leagueId={leagueId}
          open={!!swapPlayerId}
          onOpenChange={(open) => !open && setSwapPlayerId(null)}
        />
      )}
    </>
  );
}
