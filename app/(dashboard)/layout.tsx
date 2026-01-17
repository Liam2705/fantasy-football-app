import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { AppSidebar, SidebarUser } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

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
        <SidebarTrigger className="m-2" />
        {children}
    </SidebarProvider>
  );
}
