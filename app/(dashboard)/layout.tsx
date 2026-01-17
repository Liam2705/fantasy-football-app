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
          avatar: clerkUser.imageUrl,
        }
      : {
          name: "Guest",
          email: "",
          avatar: "",
        };

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} />
      <SidebarInset>
        {" "}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger />
          <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            /> 
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
