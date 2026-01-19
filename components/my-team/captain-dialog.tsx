"use client"

import { useState, useTransition } from "react"
import { DraftPick, Player } from "@/app/generated/prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Shield, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { setCaptain, setViceCaptain } from "@/app/actions/team"

type CaptainDialogProps = {
  starters: (DraftPick & { player: Player })[]
  currentCaptain: (DraftPick & { player: Player }) | undefined
  currentViceCaptain: (DraftPick & { player: Player }) | undefined
  type: "captain" | "vice-captain"
  leagueId: string
}

export function CaptainDialog({
  starters,
  currentCaptain,
  currentViceCaptain,
  type,
  leagueId
}: CaptainDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isCaptainDialog = type === "captain"
  const currentSelection = isCaptainDialog ? currentCaptain : currentViceCaptain

  const handleSelect = (pickId: string) => {
    startTransition(async () => {
      const action = isCaptainDialog ? setCaptain : setViceCaptain
      const result = await action(pickId, leagueId)

      if (result.success) {
        toast.success(
          isCaptainDialog 
            ? "Captain updated!" 
            : "Vice-captain updated!"
        )
        setOpen(false)
      } else {
        toast.error(result.error || "Failed to update")
      }
    })
  }

  const getPositionColor = (pos: string) => {
    switch(pos) {
      case 'GK': return 'bg-blue-500'
      case 'DEF': return 'bg-green-500'
      case 'MID': return 'bg-yellow-500'
      case 'FWD': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-xs px-2 h-7">
          Change
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCaptainDialog ? (
              <>
                <Star className="h-5 w-5 text-yellow-500" />
                Select Captain
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 text-gray-500" />
                Select Vice-Captain
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCaptainDialog 
              ? "Your captain will earn double points each gameweek"
              : "Your vice-captain will replace the captain if they don't play"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {starters.map((pick) => {
            const isSelected = currentSelection?.id === pick.id
            const isOtherRole = isCaptainDialog 
              ? currentViceCaptain?.id === pick.id 
              : currentCaptain?.id === pick.id

            return (
              <button
                key={pick.id}
                onClick={() => handleSelect(pick.id)}
                disabled={isPending || isOtherRole}
                className={`
                  w-full flex items-center gap-3 p-3 border rounded-lg 
                  transition-all text-left
                  ${isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                  }
                  ${isOtherRole ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                ) : isSelected ? (
                  <div className="h-4 w-4 rounded-full bg-primary flex-shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 flex-shrink-0" />
                )}

                <Badge 
                  className={`${getPositionColor(pick.player.position)} text-white flex-shrink-0`}
                >
                  {pick.player.position}
                </Badge>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {pick.player.fullName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pick.player.team_short_name} • {pick.player.total_points} pts
                  </div>
                </div>

                {isOtherRole && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {isCaptainDialog ? 'Vice' : 'Captain'}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
