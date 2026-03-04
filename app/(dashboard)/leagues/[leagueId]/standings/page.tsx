import { StandingsTable } from "@/components/leagues/standings-table"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import prisma from "@/lib/db"
import { getLeagueStandings } from "@/lib/standings"
import { getOrCreateUser } from "@/lib/user"
import { redirect } from "next/navigation"

interface StandingsPageProps {
  params: Promise<{ leagueId: string }>
}

export default async function StandingsPage({ params }: StandingsPageProps) {
  const { leagueId } = await params

  const user = await getOrCreateUser()
  if (!user) redirect('/sign-in')

  const member = await prisma.leagueMember.findUnique({
    where: {
      leagueId_userId:
      {
        leagueId,
        userId: user.id
      }
    }
  })

  if (!member) redirect('/')

  // Get league data and standings
  const [league, standings] = await Promise.all([
    prisma.league.findUnique({
      where: { id: leagueId },
      select: { name: true, lastFinalised: true }
    }),
    getLeagueStandings(leagueId)
  ])

  if (!league) redirect('/')

  const enrichedStandings = standings.map((entry) => ({
    ...entry,
    isCurrentUser: entry.userId === user.id,
  }))

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{league.name}</CardTitle>
          <CardDescription>
            {league.lastFinalised
              ? `Standings after Gameweek ${league.lastFinalised}`
              : 'No gameweeks finalised yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StandingsTable
            standings={enrichedStandings}
            lastFinalised={league.lastFinalised}
          />
        </CardContent>
      </Card>
    </div>
  )

}