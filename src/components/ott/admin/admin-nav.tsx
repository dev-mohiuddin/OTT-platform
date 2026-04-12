"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Clapperboard,
  CloudUpload,
  CreditCard,
  KeyRound,
  ScrollText,
  Settings2,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type AdminNavSection = "operations" | "content" | "monetization" | "security";

interface AdminNavItem {
  href: string;
  label: string;
  exact?: boolean;
  icon: ComponentType<{ className?: string }>;
  section: AdminNavSection;
}

const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    exact: true,
    icon: BarChart3,
    section: "operations",
  },
  {
    href: "/admin/content",
    label: "Content Library",
    icon: Clapperboard,
    section: "content",
  },
  {
    href: "/admin/upload",
    label: "Upload Studio",
    icon: CloudUpload,
    section: "content",
  },
  {
    href: "/admin/subscriptions",
    label: "Subscriptions & Plans",
    icon: CreditCard,
    section: "monetization",
  },
  {
    href: "/admin/tickets",
    label: "Ticket Sales",
    icon: Ticket,
    section: "monetization",
  },
  {
    href: "/admin/audit-logs",
    label: "Audit Logs",
    icon: ScrollText,
    section: "security",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    section: "security",
  },
  {
    href: "/admin/roles",
    label: "Roles",
    icon: ShieldCheck,
    section: "security",
  },
  {
    href: "/admin/permissions",
    label: "Permissions",
    icon: KeyRound,
    section: "security",
  },
  {
    href: "/admin/settings",
    label: "Platform Settings",
    icon: Settings2,
    section: "operations",
  },
];

const navSectionLabels: Record<AdminNavSection, string> = {
  operations: "Operations",
  content: "Content",
  monetization: "Monetization",
  security: "Security",
};

function isActivePath(pathname: string, item: AdminNavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-1">
      {(Object.keys(navSectionLabels) as AdminNavSection[]).map((section) => {
        const sectionItems = adminNavItems.filter((item) => item.section === section);

        return (
          <SidebarGroup key={section} className="gap-1 p-1">
            <SidebarGroupLabel className="px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ott-text-muted">
              {navSectionLabels[section]}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {sectionItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(pathname, item);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        className={cn(
                          "h-9 rounded-lg border px-3 transition-colors",
                          isActive
                            ? "border-transparent ott-gradient-cta text-white hover:bg-transparent hover:text-white"
                            : "border-ott-border-soft bg-background/45 text-ott-text-secondary hover:bg-background/75 hover:text-ott-text-primary",
                        )}
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </nav>
  );
}
