"use client"

import * as React from "react"
import {
  Command,
  LifeBuoy,
  Settings,
  Settings2,
  Trophy,
  Users,
  LayoutDashboard,
  List,
  ArrowLeftRight,
  UserPen,
  History
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"

function buildNavData(leagueId: string | null) {

  return {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: true,
      },
      ...(leagueId ? [
      {
        title: "My Team",
        url: "/my-team",
        icon: Users,
      },
      {
        title: "Transfers",
        url: "/transfers",
        icon: ArrowLeftRight,
      },
      {
        title: "Standings",
        url: `/leagues/${leagueId}/standings`,
        icon: List,
      },
      
    ] : []),
      {
        title: "Leagues",
        url: "/leagues",
        icon: Trophy,
        items: [
          {
            title: "My Leagues",
            url: "/leagues",
          },
          {
            title: "Create a League",
            url: "/leagues/create",
          },
          {
            title: "Join a League",
            url: "/leagues/join",
          },
        ],
      },
      
      
    ],
    navSecondary: [
      {
        title: "Profile",
        url: "/profile",
        icon: UserPen,
      },
      {
        title: "History",
        url: `/leagues/${leagueId}/history`,
        icon: History,
      },
    ],
  }
}
export type SidebarUser = {
  name: string
  email: string
  teamName?: string | null
  avatar?: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SidebarUser
  leagueId: string | null
  
}


export function AppSidebar({ user, leagueId, ...props }: AppSidebarProps) {
  const data = buildNavData(leagueId)
  const isMobile = useSidebar();
  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <img src="/logo.png" alt="Logo" className="size-9 object-contain" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.teamName ?? "No team yet"}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
