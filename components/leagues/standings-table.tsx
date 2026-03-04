'use client'
import type { StandingsEntry } from '@/lib/standings'
import { cn } from '@/lib/utils'
import { Badge, User } from 'lucide-react'
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '../ui/table'

interface StandingsTableProps {
  standings: (StandingsEntry & { isCurrentUser: boolean })[]
  lastFinalised: number | null
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-yellow-500 font-bold">🥇 1st</span>
  if (rank === 2) return <span className="text-slate-400 font-bold">🥈 2nd</span>
  if (rank === 3) return <span className="text-amber-600 font-bold">🥉 3rd</span>
  return <span className="font-medium text-muted-foreground">{rank}th</span>
}

export function StandingsTable({ standings, lastFinalised }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No standings available yet.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Manager</TableHead>
          <TableHead className="text-right">
            {lastFinalised ? `GW${lastFinalised}` : 'GW'} Pts
          </TableHead>
          <TableHead className="text-right">Total Pts</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((entry) => (
          <TableRow
            key={entry.userId}
            className={cn(entry.isCurrentUser && 'bg-muted/50 font-medium')}
          >
            <TableCell>
              <RankBadge rank={entry.rank} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>{entry.teamName ?? 'Unnamed Team'}</span>
                {entry.isCurrentUser && (
                  <User className="text-xs"></User>
                )}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {entry.username ?? '—'}
            </TableCell>
            <TableCell className="text-right">{entry.gameweekPoints}</TableCell>
            <TableCell className="text-right font-semibold">
              {entry.totalPoints}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

}