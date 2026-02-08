'use client'

import { toast } from "sonner"
import { Button } from "../ui/button"

export function SyncPlayersButton() {
  return (
    <Button onClick={async () => {
      const res = await fetch('/api/admin/sync-players')
      const data = await res.json()
      toast.success(`Synced ${data.created + data.updated} players!`)
    }}>
      🔄 Sync Players
    </Button>
  )
}
