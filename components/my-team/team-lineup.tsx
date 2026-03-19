"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DraftPick, Player } from "@/app/generated/prisma/client";
import { ArrowDownUp, BarChart2, Shield, Star } from "lucide-react";
import { CaptainDialog } from "./captain-dialog";
import { useState } from "react";
import { SwapDialog } from "./swap-dialog";
import { getTeamColour } from "@/lib/team-colours";
import { ShirtIcon } from "../shirt-icon";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { sortPlayersByPosition } from "@/lib/sort-players";

type TeamLineupProps = {
  starters: (DraftPick & { player: Player })[];
  captain: (DraftPick & { player: Player }) | undefined;
  viceCaptain: (DraftPick & { player: Player }) | undefined;
  bench: (DraftPick & { player: Player })[];
  leagueId: string;
  playerPoints?: Map<string, number>
  isLocked: boolean
};

export function TeamLineup({
  starters,
  captain,
  viceCaptain,
  bench,
  leagueId,
  playerPoints,
  isLocked
}: TeamLineupProps) {


  const [selectedPick, setSelectedPick] = useState<(DraftPick & { player: Player }) | null>(null)
  

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

  function PlayerActionDialog({
    pick,
    captain,
    viceCaptain,
    starters,
    bench,
    leagueId,
    isLocked,
    open,
    onOpenChange,
  }: {
    pick: DraftPick & { player: Player }
    captain: (DraftPick & { player: Player }) | undefined
    viceCaptain: (DraftPick & { player: Player }) | undefined
    starters: (DraftPick & { player: Player })[]
    bench: (DraftPick & { player: Player })[]
    leagueId: string
    isLocked: boolean
    open: boolean
    onOpenChange: (open: boolean) => void
  }) {
    const [swapOpen, setSwapOpen] = useState(false)
    const isCaptain = pick.id === captain?.id
    const isViceCaptain = pick.id === viceCaptain?.id

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShirtIcon
                color={getTeamColour(pick.player.team_short_name)}
                className="w-6 h-6"
              />
              {pick.player.web_name}
            </DialogTitle>
            <DialogDescription>
              {pick.player.position} · {pick.player.team_short_name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-2">
            {/* Sub */}
            {!isLocked && (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setSwapOpen(true)}
                >
                  <ArrowDownUp className="h-4 w-4" />
                  Substitute Player
                </Button>
                <SwapDialog
                  benchPlayer={pick}
                  starters={bench}
                  leagueId={leagueId}
                  open={swapOpen}
                  onOpenChange={setSwapOpen}
                />
              </>
            )}

            {/* Set Captain */}
            {!isCaptain && !isLocked && (
              <CaptainDialog
                starters={starters}
                currentCaptain={captain}
                currentViceCaptain={viceCaptain}
                type="captain"
                leagueId={leagueId}
                preselectedPlayer={pick}
                trigger={
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Set as Captain
                  </Button>
                }
              />
            )}

            {/* Set Vice Captain */}
            {!isViceCaptain && !isLocked && (
              <CaptainDialog
                starters={starters}
                currentCaptain={captain}
                currentViceCaptain={viceCaptain}
                type="vice-captain"
                leagueId={leagueId}
                preselectedPlayer={pick}
                trigger={
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    Set as Vice-Captain
                  </Button>
                }
              />
            )}

            {/* View Stats — temp placeholder */}
            <Button variant="outline" className="w-full justify-start gap-2" disabled>
              <BarChart2 className="h-4 w-4" />
              View Stats
              <span className="ml-auto text-xs text-muted-foreground">Coming soon</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }


  const PlayerCard = ({ pick }: { pick: DraftPick & { player: Player } }) => {
    const isCaptain = pick.id === captain?.id;
    const isViceCaptain = pick.id === viceCaptain?.id;
    const displayPoints = playerPoints?.get(pick.id) ?? pick.player.total_points;


    return (
      <div
        className="flex flex-col items-center gap-1 cursor-pointer"
        onClick={() => setSelectedPick(pick)}
      >
        <div className="relative">
          {isCaptain && (
            <div className="absolute -top-1 -right-1 z-10 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
              C
            </div>
          )}
          {isViceCaptain && (
            <div className="absolute -top-1 -right-1 z-10 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
              V
            </div>
          )}

          {/* Shirt */}
          <ShirtIcon
            color={getTeamColour(pick.player.team_short_name)}
            className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md hover:scale-110 transition-transform"
          />
        </div>
        
        {/* Player info pill */}
        <div className="bg-black/60 rounded px-2 py-0.5 text-center min-w-20 max-w-24">
          <div className="text-white text-xs font-semibold truncate leading-tight">
            {pick.player.web_name}
          </div>
          <div className={`text-xs font-bold leading-tight ${isCaptain ? 'text-yellow-300' : 'text-white'}`}>
            {displayPoints} pts
          </div>
        </div>
      </div>
    )
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
        <div className="relative bg-linear-to-b from-green-600 to-green-700 rounded-lg p-3 sm:p-6 min-h-150 sm:min-h-175 flex flex-col justify-between overflow-hidden">

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
      {
        selectedPick && (
          <PlayerActionDialog
            pick={selectedPick}
            captain={captain}
            viceCaptain={viceCaptain}
            starters={starters}
            bench={bench}
            leagueId={leagueId}
            isLocked={isLocked}
            open={!!selectedPick}
            onOpenChange={(open) => !open && setSelectedPick(null)}
          />
        )
      }
    </Card >
  );
}

// Captain Selection Component
export function CaptainSelection({
  captain,
  viceCaptain,
  userId,
  leagueId,
  starters,
  isLocked
}: {
  captain: (DraftPick & { player: Player }) | undefined;
  viceCaptain: (DraftPick & { player: Player }) | undefined;
  userId: string;
  leagueId: string;
  starters: (DraftPick & { player: Player })[];
  isLocked: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Captain & Vice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Captain (2x points)</div>
          <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {captain ? (
                <>
                  <div className="text-sm font-medium truncate">{captain.player.web_name}</div>
                  <div className="text-xs text-muted-foreground">{captain.player.position}</div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No captain selected</div>
              )}
            </div>
            {!isLocked && (
              <CaptainDialog
                starters={starters}
                currentCaptain={captain}
                currentViceCaptain={viceCaptain}
                type="captain"
                leagueId={leagueId}
              />
            )}

          </div>
        </div>


        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Vice-Captain</div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 border rounded-lg">
            <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {viceCaptain ? (
                <>
                  <div className="text-sm font-medium truncate">{viceCaptain.player.web_name}</div>
                  <div className="text-xs text-muted-foreground">{viceCaptain.player.position}</div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No vice-captain selected</div>
              )}
            </div>
            {!isLocked && (
              <CaptainDialog
                starters={starters}
                currentCaptain={captain}
                currentViceCaptain={viceCaptain}
                type="captain"
                leagueId={leagueId}
              />
            )}
          </div>
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
  playerPoints,
  isLocked
}: {
  bench: (DraftPick & { player: Player })[];
  starters: (DraftPick & { player: Player })[];
  leagueId: string;
  playerPoints?: Map<string, number>;
  isLocked: boolean
}) {
  const [swapPlayerId, setSwapPlayerId] = useState<string | null>(null);

  const selectedPlayer = bench.find((p) => p.id === swapPlayerId);

  const sortedBench = sortPlayersByPosition(bench)

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Substitutes</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {sortedBench.map((pick, index) => (
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
                <ShirtIcon
                  color={getTeamColour(pick.player.team_short_name)}
                  className="w-7 h-7 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {pick.player.web_name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {pick.player.team_short_name}
                  </div>
                </div>
                <div className="text-sm font-bold flex-shrink-0">
                  {playerPoints?.get(pick.id) ?? 0}
                </div>
                {!isLocked && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => setSwapPlayerId(pick.id)}
                  >
                    <ArrowDownUp className="h-4 w-4" />
                  </Button>
                )}
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
