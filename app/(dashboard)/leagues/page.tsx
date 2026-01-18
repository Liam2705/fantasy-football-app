import { getOrCreateUser } from "@/lib/user"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Crown } from "lucide-react"
import Link from "next/link"

export default async function LeaguesPage() {
  const user = await getOrCreateUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Get leagues user owns
  const ownedLeagues = await prisma.league.findMany({
    where: { ownerId: user.id },
    include: {
      members: {
        include: {
          user: {
            select: { teamName: true }
          }
        }
      }
    }
  })

  // Get leagues user has joined (but doesn't own)
  const joinedLeagues = await prisma.leagueMember.findMany({
    where: { 
      userId: user.id,
      league: {
        ownerId: { not: user.id } // Exclude owned leagues
      }
    },
    include: {
      league: {
        include: {
          members: true,
          owner: {
            select: { teamName: true }
          }
        }
      }
    }
  })

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">My Leagues</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Create a league or join one with friends
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Link href="/leagues/create">
          <Button className="w-full h-20 text-lg" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create New League
          </Button>
        </Link>
        
        <Link href="/leagues/join">
          <Button variant="outline" className="w-full h-20 text-lg" size="lg">
            <Users className="mr-2 h-5 w-5" />
            Join League
          </Button>
        </Link>
      </div>

      {/* Owned Leagues */}
      {ownedLeagues.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Your Leagues ({ownedLeagues.length})
          </h2>
          <div className="grid gap-4">
            {ownedLeagues.map((league) => (
              <Link key={league.id} href={`/leagues/${league.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{league.name}</CardTitle>
                        <CardDescription>
                          Code: <span className="font-mono font-bold">{league.code}</span>
                        </CardDescription>
                      </div>
                      <Crown className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{league.members.length} members</span>
                      </div>
                      {league.isDrafting && (
                        <span className="text-green-600 font-medium">Drafting</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Joined Leagues */}
      {joinedLeagues.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Joined Leagues ({joinedLeagues.length})
          </h2>
          <div className="grid gap-4">
            {joinedLeagues.map(({ league }) => (
              <Link key={league.id} href={`/leagues/${league.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{league.name}</CardTitle>
                    <CardDescription>
                      Owner: {league.owner.teamName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{league.members.length} members</span>
                      </div>
                      {league.isDrafting && (
                        <span className="text-green-600 font-medium">Drafting</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {ownedLeagues.length === 0 && joinedLeagues.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Leagues Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a league to compete with friends or join an existing one
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
