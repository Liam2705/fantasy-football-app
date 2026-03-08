'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { executeTransferAction } from '@/app/actions/transfer-actions'
import { DraftPick, Player } from '@/app/generated/prisma/client'
import { Position } from '@/app/generated/prisma/enums'
import { getTeamColour } from '@/lib/team-colours'
import { ShirtIcon } from '../shirt-icon'

type DraftPickWithPlayer = DraftPick & { player: Player }

interface TransferPanelProps {
  draftPicks: DraftPickWithPlayer[]
  availablePlayers: Player[]
  isGameweekLocked: boolean
  leagueId: string
}

const POSITION_ORDER: Position[] = ['GK', 'DEF', 'MID', 'FWD']

const POSITION_LABELS: Record<Position, string> = {
  GK: 'Goalkeeper',
  DEF: 'Defenders',
  MID: 'Midfielders',
  FWD: 'Forwards',
}

export default function TransferPanel({
  draftPicks,
  availablePlayers,
  isGameweekLocked,
  leagueId,
}: TransferPanelProps) {
  const [outgoingPick, setOutgoingPick] = useState<DraftPickWithPlayer | null>(null)
  const [incomingPlayer, setIncomingPlayer] = useState<Player | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filteredPool = outgoingPick
    ? availablePlayers.filter(p => p.position === outgoingPick.player.position)
    : []

  function handleSelectOutgoing(pick: DraftPickWithPlayer) {
    // Deselect if clicking the same player
    if (outgoingPick?.id === pick.id) {
      setOutgoingPick(null)
      setIncomingPlayer(null)
      return
    }
    setOutgoingPick(pick)
    setIncomingPlayer(null)
  }

  function handleSelectIncoming(player: Player) {
    setIncomingPlayer(player)
    setShowConfirm(true)
  }

  function handleCancelConfirm() {
    setShowConfirm(false)
    setIncomingPlayer(null)
  }

  function handleConfirmTransfer() {
    if (!outgoingPick || !incomingPlayer) return

    startTransition(async () => {
      const result = await executeTransferAction(
        leagueId,
        outgoingPick.player.id,
        incomingPlayer.id,
      )

      setShowConfirm(false)
      setOutgoingPick(null)
      setIncomingPlayer(null)

      if (result.success) {
        toast.success(`${incomingPlayer.web_name} transferred in successfully.`)
        // Trigger a full page refresh to reflect updated squad
        window.location.reload()
      } else {
        toast.error(result.error ?? 'Transfer failed. Please try again.')
      }
    })
  }

  const groupedByPosition = POSITION_ORDER.map(pos => ({
    position: pos,
    picks: draftPicks.filter(dp => dp.player.position === pos),
  }))

  return (
    <div className="space-y-4">
      {/* Locked banner */}
      {isGameweekLocked && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-yellow-800 text-sm font-medium">
          ⚠️ Transfers are currently unavailable — the gameweek is locked.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT — Your Squad View */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Squad</h2>
          <div className="space-y-6">
            {groupedByPosition.map(({ position, picks }) => (
              <div key={position}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {POSITION_LABELS[position]}
                </h3>
                <div className="space-y-2">
                  {picks.map(pick => {
                    const isSelected = outgoingPick?.id === pick.id
                    return (
                      <div
                        key={pick.id}
                        className={`flex items-center justify-between rounded-md border px-4 py-3 transition-colors ${isSelected
                          ? 'border-red-500 bg-red-50'
                          : 'border-border bg-card'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShirtIcon
                            color={getTeamColour(pick.player.team_short_name)}
                            className="w-7 h-7 shrink-0"
                          />
                          <div>
                            <p className="font-medium text-sm">{pick.player.web_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {pick.player.team_short_name} · {pick.player.total_points} pts
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pick.isCaptain && (
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 rounded px-1.5 py-0.5">
                              C
                            </span>
                          )}
                          {pick.isViceCaptain && (
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 rounded px-1.5 py-0.5">
                              VC
                            </span>
                          )}
                          {!isGameweekLocked && (
                            <button
                              onClick={() => handleSelectOutgoing(pick)}
                              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${isSelected
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-muted hover:bg-muted/80 text-foreground'
                                }`}
                            >
                              {isSelected ? 'Cancel' : 'Transfer Out'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Available Players */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {outgoingPick
              ? `Available ${POSITION_LABELS[outgoingPick.player.position]}`
              : 'Available Players'}
          </h2>

          {!outgoingPick ? (
            <div className="flex items-center justify-center h-48 rounded-md border border-dashed text-sm text-muted-foreground">
              Select a player to transfer out to see available replacements.
            </div>
          ) : filteredPool.length === 0 ? (
            <div className="flex items-center justify-center h-48 rounded-md border border-dashed text-sm text-muted-foreground">
              No available {POSITION_LABELS[outgoingPick.player.position].toLowerCase()} at this time.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredPool.map(player => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <ShirtIcon
                      color={getTeamColour(player.team_short_name)}
                      className="w-7 h-7 shrink-0"
                    />
                    <div>
                      <p className="font-medium text-sm">{player.web_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {player.team_short_name} · {player.total_points} pts
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectIncoming(player)}
                    disabled={isPending}
                    className="text-xs px-3 py-1.5 rounded-md font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Transfer In
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && outgoingPick && incomingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl border border-border w-full max-w-sm mx-4 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Confirm Transfer</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to transfer out{' '}
              <span className="font-semibold text-foreground">
                {outgoingPick.player.web_name}
              </span>{' '}
              and bring in{' '}
              <span className="font-semibold text-foreground">
                {incomingPlayer.web_name}
              </span>
              ?
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Out</p>
                <p className="font-semibold text-red-700">{outgoingPick.player.web_name}</p>
                <p className="text-xs text-muted-foreground">{outgoingPick.player.team_short_name}</p>
              </div>
              <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">In</p>
                <p className="font-semibold text-green-700">{incomingPlayer.web_name}</p>
                <p className="text-xs text-muted-foreground">{incomingPlayer.team_short_name}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancelConfirm}
                disabled={isPending}
                className="flex-1 text-sm px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransfer}
                disabled={isPending}
                className="flex-1 text-sm px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Confirming…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
