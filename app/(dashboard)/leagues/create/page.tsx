import { getOrCreateUser } from "@/lib/user"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateLeagueForm } from "@/components/leagues/create-league-form"

export default async function CreateLeaguePage() {
  const user = await getOrCreateUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Create New League</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Set up your fantasy league and invite friends
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>League Details</CardTitle>
            <CardDescription>
              Choose a name for your league. You'll get a unique code to share with others.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateLeagueForm userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
