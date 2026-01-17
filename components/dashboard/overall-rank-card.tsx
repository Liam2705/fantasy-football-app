import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface OverallRankCardProps {
  rank: number
  change: number
}

export function OverallRankCard({
  rank,
  change,
}: OverallRankCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Overall Rank</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{rank.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          {change >= 0 ? "↑" : "↓"} {Math.abs(change).toLocaleString()} this GW
        </p>
      </CardContent>
    </Card>
  )
}
