"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { KeyRound, ShieldCheck, Users } from "lucide-react";

import { callAdminApi } from "@/components/ott/admin/api";
import type {
  AdminPermission,
  AdminRole,
  AdminUser,
} from "@/components/ott/admin/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardState {
  users: AdminUser[];
  roles: AdminRole[];
  permissions: AdminPermission[];
}

export function AdminOverview() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setErrorMessage(null);

        const [users, roles, permissions] = await Promise.all([
          callAdminApi<AdminUser[]>("/api/v1/admin/users"),
          callAdminApi<AdminRole[]>("/api/v1/admin/roles"),
          callAdminApi<AdminPermission[]>("/api/v1/admin/permissions"),
        ]);

        setState({
          users,
          roles,
          permissions,
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load admin dashboard.");
      }
    }

    void load();
  }, []);

  const activeAdmins = useMemo(
    () => state?.users.filter((user) => user.roles.length > 0 && user.isActive).length ?? 0,
    [state],
  );

  const stats = [
    {
      title: "Total Users",
      value: state?.users.length ?? 0,
      subtitle: `${activeAdmins} active admin/member accounts`,
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Roles",
      value: state?.roles.length ?? 0,
      subtitle: `${state?.roles.filter((role) => role.isSystem).length ?? 0} system roles`,
      icon: ShieldCheck,
      href: "/admin/roles",
    },
    {
      title: "Permissions",
      value: state?.permissions.length ?? 0,
      subtitle: "Granular access rules configured",
      icon: KeyRound,
      href: "/admin/permissions",
    },
  ];

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-ott-text-primary">Admin Dashboard</h1>
        <p className="text-sm text-ott-text-secondary">
          Manage users, roles, and permission policies for platform operations.
        </p>
      </div>

      {errorMessage ? (
        <Card className="border border-red-500/30 bg-red-500/10">
          <CardContent className="pt-4 text-sm text-red-200">{errorMessage}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href}>
              <Card className="ott-card ott-card-hover h-full border border-ott-border-soft">
                <CardHeader>
                  <CardDescription className="flex items-center gap-2 text-ott-text-secondary">
                    <Icon className="size-4" />
                    {item.title}
                  </CardDescription>
                  <CardTitle className="text-3xl font-semibold">{item.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-ott-text-secondary">{item.subtitle}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>System Roles Snapshot</CardTitle>
          <CardDescription>Quick visibility of active role definitions and permission load.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(state?.roles ?? []).map((role) => (
              <Badge key={role.id} variant="outline" className="border-ott-border-soft text-ott-text-secondary">
                {role.slug} ({role.permissions.length})
              </Badge>
            ))}
            {state && state.roles.length === 0 ? (
              <p className="text-sm text-ott-text-muted">No roles available.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
