import { SyncPlayersButton } from "@/components/admin/sync-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Sync Players</CardTitle>
            <CardDescription>Update all player stats from FPL API</CardDescription>
          </CardHeader>
          <CardContent>
            <SyncPlayersButton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
