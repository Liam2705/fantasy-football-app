"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/my-team": "My Team",
  "/transfers": "Transfers",
  "/leagues": "Leagues",
  "/leagues/create": "Create League",
  "/leagues/join": "Join League",
  "/user-profile": "My Account",

}

function getLabel(pathname: string): string {
  if (routeLabels[pathname]) return routeLabels[pathname]

  if (/^\/leagues\/[^/]+\/standings$/.test(pathname)) return "Standings"
  
  if (/^\/leagues\/[^/]+$/.test(pathname)) return "League"

  const last = pathname.split("/").filter(Boolean).at(-1) ?? ""
  return last.charAt(0).toUpperCase() + last.slice(1)
}

export function BreadcrumbNav() {
  const pathname = usePathname()

  const label = routeLabels[pathname] ?? 
    pathname.split("/").filter(Boolean).map(s => 
      s.charAt(0).toUpperCase() + s.slice(1)
    ).join(" › ")

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{getLabel(pathname)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
