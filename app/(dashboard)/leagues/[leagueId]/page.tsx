import { getOrCreateUser } from "@/lib/user"
import prisma from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Crown, Users, Trophy, Pencil } from "lucide-react"
import Link from "next/link"
import { CopyCodeButton } from "@/components/leagues/copy-code-button"
import { LeagueMembersList } from "@/components/leagues/league-members-list"


export default async function LeagueDetailPage({
  params
}: {
  params: Promise<{ leagueId: string }>
}) {
  const user = await getOrCreateUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  const { leagueId } = await params

  // Fetch the league with all related data
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      owner: {
        select: {
          id: true,
          teamName: true,
          email: true
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              teamName: true,
              email: true,
              totalPoints: true,
              currentRank: true,
              draftComplete: true
            }
          }
        },
        orderBy: {
          draftPosition: 'asc' // Show members in draft order
        }
      }
    }
  })

  // If league doesn't exist, show 404
  if (!league) {
    notFound()
  }

  // Check if current user is a member of this league
  const userMembership = league.members.find(m => m.userId === user.id)
  const isOwner = league.ownerId === user.id
  const isMember = !!userMembership

  // If not a member, they shouldn't access this page
  if (!isMember) {
    redirect('/leagues')
  }

  // Count how many members have completed draft
  const membersWithDraft = league.members.filter(m => m.user.draftComplete).length
  const totalMembers = league.members.length

  return (
    <div className="flex-1 p-4 sm:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              {league.name}
              {isOwner && <Crown className="h-6 w-6 text-yellow-500" />}
            </h1>
            <p className="text-sm text-muted-foreground">
              Owned by {league.owner.teamName}
            </p>
          </div>
          
          {isOwner && (
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        {/* League Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{totalMembers} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>Gameweek {league.currentGameweek}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - League Info & Actions */}
        <div className="lg:col-span-1 space-y-4">
          {/* League Code Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invite Code</CardTitle>
              <CardDescription>
                Share this code with friends to join
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-2xl font-mono font-bold tracking-wider">
                  {league.code}
                </span>
                <CopyCodeButton code={league.code} />
              </div>
              <p className="text-xs text-muted-foreground">
                Friends can join at <span className="font-semibold">/leagues/join</span>
              </p>
            </CardContent>
          </Card>

          {/* Draft Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Draft Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Teams Ready</span>
                  <span className="text-sm font-semibold">
                    {membersWithDraft}/{totalMembers}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(membersWithDraft / totalMembers) * 100}%` }}
                  />
                </div>
              </div>

              {/* Draft Button */}
              {userMembership?.user.draftComplete ? (
                <div className="text-center py-2">
                  <Badge variant="default" className="text-sm">
                    ✓ Draft Complete
                  </Badge>
                </div>
              ) : (
                <Link href={`/leagues/${league.id}/draft`}>
                  <Button className="w-full" size="lg">
                    Start Draft
                  </Button>
                </Link>
              )}

              {/* My Team Button (only showing after draft complete) */}
              {userMembership?.user.draftComplete && (
                <Link href="/my-team">
                  <Button variant="outline" className="w-full">
                    Manage My Team
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* League Settings (Owner Only) */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">League Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Privacy</span>
                  <Badge variant={league.isPrivate ? "secondary" : "outline"}>
                    {league.isPrivate ? "Private" : "Public"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Draft Status</span>
                  <Badge variant={league.isDrafting ? "default" : "secondary"}>
                    {league.isDrafting ? "Active" : "Not Started"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Members List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>League Members</CardTitle>
              <CardDescription>
                {totalMembers} {totalMembers === 1 ? 'manager' : 'managers'} in this league
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeagueMembersList 
                members={league.members} 
                ownerId={league.ownerId}
                currentUserId={user.id}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
