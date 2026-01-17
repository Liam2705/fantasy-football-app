import { GameweekPointsCard } from "@/components/dashboard/gameweek-points-card";
import { OverallRankCard } from "@/components/dashboard/overall-rank-card";
import { TeamLineupCard } from "@/components/dashboard/team-lineup-card";
import { TransfersCard } from "@/components/dashboard/transfers-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "lucide-react";

export default async function Page() {
  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <GameweekPointsCard
              gameweek={22}
              points={34}
              change={12}
              progress={76}
            />
            <OverallRankCard rank={0} change={0} />
            <TransfersCard transfers={0} freeTransfers={0} />
          </div>
          <TeamLineupCard
            captain="Erling Haaland"
            viceCaptain="Mohamed Salah"
            starters={[
              { name: "Ederson", team: "Man City", position: "GK", points: 8 },
              {
                name: "Ruben Dias",
                team: "Man City",
                position: "DEF",
                points: 6,
              },
              {
                name: "Virgil van Dijk",
                team: "Liverpool",
                position: "DEF",
                points: 7,
              },
              {
                name: "Virgil van Dijk",
                team: "Liverpool",
                position: "DEF",
                points: 7,
              },
              {
                name: "Virgil van Dijk",
                team: "Liverpool",
                position: "DEF",
                points: 7,
              },
              {
                name: "Virgil van Dijk",
                team: "Liverpool",
                position: "DEF",
                points: 7,
              },
              {
                name: "Virgil van Dijk",
                team: "Liverpool",
                position: "DEF",
                points: 7,
              },
              {
                name: "Virgil van Dijk",
                team: "Liverpool",
                position: "DEF",
                points: 7,
              },
              {
                name: "Virgil van Dijk",
                team: "Liverpool",
                position: "DEF",
                points: 7,
              },
              {
                name: "Virgil van Dijk",
                team: "Liverpool",
                position: "MID",
                points: 7,
              },
              {
                name: "Virgil van Dijk",
                team: "Liverpool",
                position: "FWD",
                points: 7,
              },
              // ... add 8 more starters
            ]}
            bench={[
              {
                name: "Nathan Ake",
                team: "Man City",
                position: "DEF",
                points: 0,
              },
              {
                name: "Cole Palmer",
                team: "Chelsea",
                position: "MID",
                points: 0,
              },
              // ... add 2 more bench players
            ]}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
