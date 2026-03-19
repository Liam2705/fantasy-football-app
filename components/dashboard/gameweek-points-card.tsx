import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface GameweekPointsCardProps {
  gameweek: number | null
  points: number
  change: number
  progress: number
}

export function GameweekPointsCard({
  gameweek,
  points,
  change,
  progress,
}: GameweekPointsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Gameweek Points</CardTitle>
        <Badge variant="outline">GW {gameweek}</Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{points}</div>
        <p className="text-xs text-muted-foreground">
          {change >= 0 ? "+" : ""}{change} pts this week
        </p>
        <Progress value={progress} className="mt-2 h-2" />
      </CardContent>
    </Card>
  )
}
