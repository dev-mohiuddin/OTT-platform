"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, KeyRound, ShieldCheck, Users } from "lucide-react";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

interface AdminNavItem {
  href: string;
  label: string;
  exact?: boolean;
  icon: ComponentType<{ className?: string }>;
}

const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    exact: true,
    icon: BarChart3,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/roles",
    label: "Roles",
    icon: ShieldCheck,
  },
  {
    href: "/admin/permissions",
    label: "Permissions",
    icon: KeyRound,
  },
];

function isActivePath(pathname: string, item: AdminNavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(pathname, item);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
              isActive
                ? "border-transparent ott-gradient-cta text-white"
                : "border-ott-border-soft bg-background/45 text-ott-text-secondary hover:bg-background/75 hover:text-ott-text-primary",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
