import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Clapperboard } from "lucide-react";

import { auth } from "@/auth";
import { AdminNav } from "@/components/ott/admin/admin-nav";
import { AdminSignOutButton } from "@/components/ott/admin/admin-sign-out-button";
import { ThemeToggle } from "@/components/ott/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-(image:--ott-gradient-page)">
      <header className="sticky top-0 z-40 border-b border-ott-border-soft/80 bg-background/85 backdrop-blur-xl">
        <div className="ott-shell flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-sm font-medium">
              <span className="inline-flex size-7 items-center justify-center rounded-md ott-gradient-cta">
                <Clapperboard className="size-4" />
              </span>
              <span className="font-heading text-lg">Dristy Admin</span>
            </Link>
            <Badge variant="outline" className="hidden border-ott-border-soft text-ott-text-secondary sm:inline-flex">
              Secure Ops Console
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-ott-text-secondary md:inline">{userDisplayName}</span>
            <ThemeToggle className="rounded-full border-ott-border-soft bg-background/70" />
            <AdminSignOutButton />
          </div>
        </div>
      </header>

      <div className="ott-shell grid gap-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-3 rounded-xl border border-ott-border-soft bg-background/45 p-4 backdrop-blur-sm">
          <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-ott-text-muted">Navigation</h2>
          <AdminNav />
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
