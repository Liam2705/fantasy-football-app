"use client"

import { useOptimistic, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { removePlayerFromSquad, confirmDraft } from "@/app/actions/draft"
import { Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { DraftPick, Player } from "@/app/generated/prisma/client"
import { useRouter } from "next/navigation"

type SelectedSquadProps = {
  picks: (DraftPick & { player: Player })[]
  userId: string
  leagueId: string
}

export function SelectedSquad({ picks, userId, leagueId }: SelectedSquadProps) {
  
  const router = useRouter();
  const [isPending, startTransition] = useTransition()
  const [optimisticPicks, removeOptimisticPick] = useOptimistic(
    picks,
    (state, pickIdToRemove: string) => state.filter(p => p.id !== pickIdToRemove)
  )

  // Calculate limits from OPTIMISTIC state
  const limits = {
    GK: { current: optimisticPicks.filter(p => p.player.position === 'GK').length, max: 2 },
    DEF: { current: optimisticPicks.filter(p => p.player.position === 'DEF').length, max: 5 },
    MID: { current: optimisticPicks.filter(p => p.player.position === 'MID').length, max: 5 },
    FWD: { current: optimisticPicks.filter(p => p.player.position === 'FWD').length, max: 3 },
  }

  const isComplete = optimisticPicks.length === 15

  const handleRemovePlayer = async (pickId: string) => {
    startTransition(async () => {
      // Instantly remove from UI
      removeOptimisticPick(pickId)

      const formData = new FormData()
      formData.append('pickId', pickId)
      
      const result = await removePlayerFromSquad(formData)
      
      if (result.success) {
        toast.success("Player removed from squad")
      } else {
        toast.error(result.error || "Failed to remove player")
        // React automatically reverts on error
      }
    })
  }

  const handleConfirmDraft = async () => {
    startTransition(async () => {
      const result = await confirmDraft(leagueId)
      
      if (result.success) {
        toast.success("Draft complete! Redirecting to team...")
        setTimeout(() => {
          router.push(`/my-team`)
        }, 1500)
      } else {
        toast.error(result.error || "Failed to confirm draft")
      }
    })
  }



  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl">
            Your Squad ({optimisticPicks.length}/15)
          </CardTitle>
          {isComplete && <Badge variant="default" className="text-xs">Complete!</Badge>}
        </div>

        <div className="grid grid-cols-4 gap-1 sm:gap-2 mt-3 sm:mt-4">
          {Object.entries(limits).map(([pos, { current, max }]) => (
            <div key={pos} className="text-center p-1 sm:p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">{pos}</div>
              <div className={`text-sm font-bold ${current === max ? 'text-green-600' : ''}`}>
                {current}/{max}
              </div>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="space-y-2 max-h-[300px] sm:max-h-[500px] overflow-y-auto">
          {optimisticPicks.map((pick) => (
            <div
              key={pick.id}
              className="flex items-center justify-between p-2 border rounded-lg gap-2"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Badge variant="outline" className="flex-shrink-0 text-xs">
                  {pick.player.position}
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs sm:text-sm truncate">
                    {pick.player.web_name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {pick.player.team}
                  </div>
                </div>
              </div>

              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                onClick={() => handleRemovePlayer(pick.id)}
                disabled={isPending}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          ))}

          {optimisticPicks.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">
              No players selected yet
            </div>
          )}
        </div>

        {isComplete && (
          <Button 
            className="w-full mt-4" 
            size="lg"
            onClick={handleConfirmDraft}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm Squad'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
