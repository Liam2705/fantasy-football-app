import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { AppSidebar, SidebarUser } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const clerkUser = await currentUser();

  let dbUser = null;

  if (clerkUser) {
    dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });
  }

  const sidebarUser: SidebarUser =
    clerkUser && dbUser
      ? {
        name:
          dbUser.firstName || dbUser.lastName
            ? `${dbUser.firstName ?? ""} ${dbUser.lastName ?? ""}`.trim()
            : (dbUser.username ??
              clerkUser.fullName ??
              clerkUser.emailAddresses[0]?.emailAddress ??
              "User"),
        email: dbUser.email,
        teamName: dbUser.teamName,
        avatar: clerkUser.imageUrl,
      }
      : {
        name: "Guest",
        email: "",
        avatar: "",
      };

  const membership = await prisma.leagueMember.findUnique({
    where: { userId: dbUser?.id },
    select: { leagueId: true },
  })

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>
      <AppSidebar
        user={sidebarUser}
        leagueId={membership?.leagueId ?? null}
      />
      <SidebarInset>
        {" "}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <BreadcrumbNav />
          <ThemeToggle className="ml-auto" />
        </header>
        <main id="main-content" tabIndex={-1} className="p-6">{children}</main>
      </SidebarInset>
      <Toaster position="top-right" />
    </SidebarProvider>
  );
}
