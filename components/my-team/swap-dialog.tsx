"use client";

import { useState, useTransition } from "react";
import { DraftPick, Player } from "@/app/generated/prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { swapPlayers } from "@/app/actions/team";
import { toast } from "sonner";

type SwapDialogProps = {
  benchPlayer: DraftPick & { player: Player };
  starters: (DraftPick & { player: Player })[];
  leagueId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SwapDialog({
  benchPlayer,
  starters,
  leagueId,
  open,
  onOpenChange,
}: SwapDialogProps) {
  const [isPending, startTransition] = useTransition();

  // Filter valid starters to swap with
  const eligibleStarters = starters;

  const handleSwap = (starterPickId: string) => {
    startTransition(async () => {
      const result = await swapPlayers(benchPlayer.id, starterPickId, leagueId);

      if (result.success) {
        toast.success(
          `${benchPlayer.player.lastName} swapped into starting lineup!`
        );
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to swap players");
      }
    });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownUp className="h-5 w-5" />
            Swap {benchPlayer.player.lastName}
          </DialogTitle>
          <DialogDescription>
            Select a starter to swap with • Formation will auto-adjust
          </DialogDescription>
        </DialogHeader>


        <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6">
          <div className="space-y-2">
            {eligibleStarters.map((starter) => {
              const isCrossPosition =
                starter.player.position !== benchPlayer.player.position;

              return (
                <button
                  key={starter.id}
                  onClick={() => handleSwap(starter.id)}
                  disabled={isPending}
                  className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <Badge
                    className={`${getPositionColor(starter.player.position)} text-white flex-shrink-0 text-xs`}
                  >
                    {starter.player.position}
                  </Badge>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {starter.player.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {starter.player.team_short_name} •{" "}
                      {starter.player.total_points} pts
                    </div>
                  </div>

                  {isCrossPosition && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] sm:text-xs flex-shrink-0 hidden sm:inline-flex"
                    >
                      Formation
                    </Badge>
                  )}

                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                  ) : (
                    <ArrowDownUp className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
              );
            })}

            {eligibleStarters.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No starters available
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
