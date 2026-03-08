import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import prisma  from '@/lib/db'
import TransferPanel from '@/components/transfers/transfer-panel'

export default async function TransfersPage() {
  const user = await getOrCreateUser()
  if (!user) redirect('/sign-in')

  if (!user.draftComplete) redirect('/draft')

  const membership = await prisma.leagueMember.findUnique({
    where: { userId: user.id },
    include: { league: true },
  })

  if (!membership) redirect('/leagues')

  const { league } = membership

  // Fetch the user's current squad with player data
  const draftPicks = await prisma.draftPick.findMany({
    where: { userId: user.id, leagueId: league.id },
    include: { player: true },
    orderBy: { lineupSlot: 'asc' },
  })

  // Fetch all undrafted players
  const availablePlayers = await prisma.player.findMany({
    where: { isDrafted: false },
    orderBy: { total_points: 'desc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Transfers</h1>
      <TransferPanel
        draftPicks={draftPicks}
        availablePlayers={availablePlayers}
        isGameweekLocked={league.isGameweekLocked}
        leagueId={league.id}
      />
    </div>
  )
}
