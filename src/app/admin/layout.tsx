import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Clapperboard } from "lucide-react";

import { auth } from "@/auth";
import { AdminNav } from "@/components/ott/admin/admin-nav";
import { AdminSignOutButton } from "@/components/ott/admin/admin-sign-out-button";
import { ThemeToggle } from "@/components/ott/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { hasPermission } from "@/lib/auth/access";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  const permissions = session?.user?.permissions ?? [];

  if (!session?.user?.id || !hasPermission({ roles, permissions }, ADMIN_PERMISSION.PANEL_ACCESS)) {
    redirect("/sign-in");
  }

  const userDisplayName = session.user.name ?? session.user.email ?? "Administrator";

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r border-ott-border-soft/80">
        <SidebarHeader className="border-b border-ott-border-soft/80 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium">
              <span className="inline-flex size-7 items-center justify-center rounded-md ott-gradient-cta">
                <Clapperboard className="size-4" />
              </span>
              <span className="font-heading text-lg">Dristy Admin</span>
            </Link>
            <SidebarTrigger />
          </div>
          <Badge variant="outline" className="w-fit border-ott-border-soft text-ott-text-secondary">
            Secure Ops Console
          </Badge>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3 [scrollbar-width:auto] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sidebar-border">
          <div className="space-y-3">
            <h2 className="px-2 text-xs font-medium uppercase tracking-[0.14em] text-ott-text-muted">Navigation</h2>
            <AdminNav />
          </div>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-screen bg-(image:--ott-gradient-page) dark:bg-none dark:bg-background">
        <header className="sticky top-0 z-30 border-b border-ott-border-soft/80 bg-background/85 backdrop-blur-xl">
          <div className="ott-shell flex h-16 items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Link href="/admin" className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-sm font-medium">
                <span className="inline-flex size-7 items-center justify-center rounded-md ott-gradient-cta">
                  <Clapperboard className="size-4" />
                </span>
                <span className="font-heading text-lg">Dristy Admin</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-ott-text-secondary md:inline">{userDisplayName}</span>
              <ThemeToggle className="rounded-full border-ott-border-soft bg-background/70" />
              <AdminSignOutButton />
            </div>
          </div>
        </header>

        <div className="ott-shell py-6">
          <main className="space-y-6">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
