"use client"

import { useState, useOptimistic, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { addPlayerToSquad } from "@/app/actions/draft"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { DraftPick, Player } from "@/app/generated/prisma/client"

type PlayerListProps = {
  players: Player[]
  currentPicks: (DraftPick & { player: Player })[]
  leagueId: string
}

export function PlayerList({ players, currentPicks, leagueId }: PlayerListProps) {
  const [search, setSearch] = useState("")
  const [position, setPosition] = useState("ALL")
  const [isPending, startTransition] = useTransition()

  const [optimisticPicks, addOptimisticPick] = useOptimistic(
    currentPicks,
    (state, newPick: DraftPick & { player: Player }) => [...state, newPick]
  )

  // Calculate position counts from OPTIMISTIC state 
  const positionCounts = {
    GK: optimisticPicks.filter(p => p.player.position === 'GK').length,
    DEF: optimisticPicks.filter(p => p.player.position === 'DEF').length,
    MID: optimisticPicks.filter(p => p.player.position === 'MID').length,
    FWD: optimisticPicks.filter(p => p.player.position === 'FWD').length,
  }

  const limits = { GK: 2, DEF: 5, MID: 5, FWD: 3 }

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.web_name.toLowerCase().includes(search.toLowerCase())
    const matchesPosition = position === "ALL" || player.position === position
    const notPicked = !optimisticPicks.find(p => p.playerId === player.id)
    return matchesSearch && matchesPosition && notPicked
  })

  const getPositionColor = (pos: string) => {
    switch(pos) {
      case 'GK': return 'bg-blue-500'
      case 'DEF': return 'bg-green-500'
      case 'MID': return 'bg-yellow-500'
      case 'FWD': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const isPositionFull = (pos: string) => {
    return positionCounts[pos as keyof typeof positionCounts] >= limits[pos as keyof typeof limits]
  }


  const handleAddPlayer = async (player: Player) => {
    // Create a temporary draft pick object for optimistic UI
    const tempPick: DraftPick & { player: Player } = {
      id: `temp-${Date.now()}`, // Temporary ID
      userId: '', // set by server
      createdAt: new Date(), 
      playerId: player.id,
      leagueId: leagueId,
      pickOrder: optimisticPicks.length + 1,
      lineupSlot: optimisticPicks.length + 1,
      isCaptain: false,
      isViceCaptain: false,
      player: player
    }

    startTransition(async () => {
      // Instantly update UI (before server responds)
      addOptimisticPick(tempPick)

      // Create FormData for server action
      const formData = new FormData()
      formData.append('playerId', player.id)
      formData.append('leagueId', leagueId)
      
      const result = await addPlayerToSquad(formData)
      
      if (result.success) {
        toast.success("Player added to squad!")
      } else {
        toast.error(result.error || "Failed to add player")
        // On error, React automatically reverts optimisticPicks
      }
    })
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">
          Available Players ({filteredPlayers.length})
        </CardTitle>
        
        <div className="relative mt-3 sm:mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 sm:h-10 text-sm"
          />
        </div>

        <Tabs value={position} onValueChange={setPosition} className="mt-3 sm:mt-4">
          <TabsList className="grid w-full grid-cols-5 h-9 sm:h-10">
            <TabsTrigger value="ALL" className="text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="GK" className="text-xs sm:text-sm">GK</TabsTrigger>
            <TabsTrigger value="DEF" className="text-xs sm:text-sm">DEF</TabsTrigger>
            <TabsTrigger value="MID" className="text-xs sm:text-sm">MID</TabsTrigger>
            <TabsTrigger value="FWD" className="text-xs sm:text-sm">FWD</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="space-y-2 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
          {filteredPlayers.map((player) => {
            const positionFull = isPositionFull(player.position)
            const squadFull = optimisticPicks.length >= 15

            return (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="secondary" 
                      className={`${getPositionColor(player.position)} text-white text-xs px-1.5 py-0 flex-shrink-0`}
                    >
                      {player.position}
                    </Badge>
                    <div className="font-medium text-sm sm:text-base truncate">
                      {player.web_name}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {player.team_short_name} • {player.goals_scored}G {player.assists}A • {player.total_points}pts
                  </div>
                </div>

                <Button 
                  size="sm" 
                  onClick={() => handleAddPlayer(player)}
                  className="h-8 px-3 text-xs sm:text-sm"
                  disabled={positionFull || squadFull || isPending}
                >
                  {positionFull ? 'Full' : squadFull ? 'Full' : 'Add'}
                </Button>
              </div>
            )
          })}

          {filteredPlayers.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No players found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
