import { getOrCreateUser } from "@/lib/user"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { JoinLeagueForm } from "@/components/leagues/join-league-form"

export default async function JoinLeaguePage() {
  const user = await getOrCreateUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Join a League</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Enter the league code shared by your league owner
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>League Code</CardTitle>
            <CardDescription>
              Ask your league owner for the 6-character code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JoinLeagueForm userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
