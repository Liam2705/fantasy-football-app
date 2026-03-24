import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import { getGameweekHistory } from '@/lib/history'
import GameweekHistoryTable from '@/components/leagues/gameweek-history-table'


interface Props {
  params: Promise<{ leagueId: string }>
}

export default async function GameweekHistoryPage({ params }: Props) {
  const { leagueId } = await params
  const user = await getOrCreateUser()
  if (!user) redirect('/sign-in')

  const history = await getGameweekHistory(user.id, leagueId)

  return (
    <div className="max-w-3l mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Gameweek History</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Your points breakdown across every finalised gameweek.
      </p>
      <GameweekHistoryTable history={history} />
    </div>
  )
}
