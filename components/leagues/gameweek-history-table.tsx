// app/leagues/[leagueId]/history/_components/GameweekHistoryTable.tsx
'use client'

import { useState } from 'react'
import type { GameweekHistoryRow } from '@/lib/history'
import { ChevronDown, ChevronUp, ArrowLeftRight } from 'lucide-react'

interface Props {
  history: GameweekHistoryRow[]
}

export default function GameweekHistoryTable({ history }: Props) {
  const [expandedGw, setExpandedGw] = useState<number | null>(null)

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-md border border-dashed text-sm text-muted-foreground">
        No gameweeks have been finalised yet.
      </div>
    )
  }

  const totalPoints = history.reduce((sum, row) => sum + row.points, 0)
  const bestGw = history.reduce((best, row) =>
    row.points > best.points ? row : best,
  )
  const avgPoints = Math.round(totalPoints / history.length)

  function toggleExpand(gw: number) {
    setExpandedGw(prev => (prev === gw ? null : gw))
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total Points" value={totalPoints} />
        <SummaryCard label="Best Gameweek" value={`GW${bestGw.gameweek} (${bestGw.points} pts)`} />
        <SummaryCard label="Avg per GW" value={avgPoints} />
      </div>

      {/* History rows */}
      <div className="rounded-md border border-border overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="col-span-3">Gameweek</span>
          <span className="col-span-3 text-right">Points</span>
          <span className="col-span-3 text-right">Rank</span>
          <span className="col-span-3 text-right">Auto-subs</span>
        </div>

        {/* Rows */}
        {history.map(row => {
          const isExpanded = expandedGw === row.gameweek
          const hasAutosubs = row.autosubs.length > 0

          return (
            <div key={row.gameweek} className="border-t border-border">
              {/* Main row */}
              <button
                onClick={() => hasAutosubs && toggleExpand(row.gameweek)}
                className={`w-full grid grid-cols-12 px-4 py-3 text-sm items-center transition-colors ${
                  hasAutosubs
                    ? 'hover:bg-muted/50 cursor-pointer'
                    : 'cursor-default'
                }`}
              >
                <span className="col-span-3 font-medium text-left">
                  GW{row.gameweek}
                </span>
                <span className="col-span-3 text-right font-semibold">
                  {row.points}
                </span>
                <span className="col-span-3 text-right text-muted-foreground">
                  {row.rank ? `#${row.rank}` : '—'}
                </span>
                <span className="col-span-3 flex items-center justify-end gap-1 text-muted-foreground">
                  {hasAutosubs ? (
                    <>
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>{row.autosubs.length}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </>
                  ) : (
                    <span>—</span>
                  )}
                </span>
              </button>

              {/* expanded auto-sub detail */}
              {isExpanded && hasAutosubs && (
                <div className="px-4 pb-3 space-y-1.5 bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Auto-substitutions
                  </p>
                  {row.autosubs.map((sub, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-foreground"
                    >
                      <span className="text-red-500 font-medium">{sub.playerOut}</span>
                      <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-green-600 font-medium">{sub.playerIn}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <div className="grid grid-cols-12 px-4 py-3 border-t border-border bg-muted/60 text-sm font-semibold">
          <span className="col-span-3">Total</span>
          <span className="col-span-3 text-right">{totalPoints}</span>
          <span className="col-span-6" />
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}
