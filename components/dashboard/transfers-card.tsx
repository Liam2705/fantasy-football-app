import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface TransfersCardProps {
  transfers: number
  freeTransfers: number
}

export function TransfersCard({
  transfers,
  freeTransfers,
}: TransfersCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Transfers Left</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{transfers}</div>
        <p className="text-xs text-muted-foreground">
          Free transfers: {freeTransfers}
        </p>
      </CardContent>
    </Card>
  )
}
