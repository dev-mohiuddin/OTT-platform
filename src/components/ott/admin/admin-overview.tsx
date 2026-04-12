"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Clapperboard,
  CloudUpload,
  CreditCard,
  KeyRound,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";

import {
  callAdminApi,
  createAdminContentDraft,
  fetchAdminDashboardSummary,
} from "@/components/ott/admin/api";
import type {
  AdminDashboardSummary,
  AdminPermission,
  AdminRole,
  AdminUser,
} from "@/components/ott/admin/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardState {
  users: AdminUser[];
  roles: AdminRole[];
  permissions: AdminPermission[];
  dashboardSummary: AdminDashboardSummary;
}

type AccessMode = "subscription" | "ticket" | "hybrid";

interface QuickDraftState {
  title: string;
  thumbnailUrl: string;
  accessMode: AccessMode;
}

const initialQuickDraft: QuickDraftState = {
  title: "",
  thumbnailUrl: "",
  accessMode: "hybrid",
};

export function AdminOverview() {
  const router = useRouter();
  const [state, setState] = useState<DashboardState | null>(null);
  const [quickDraft, setQuickDraft] = useState<QuickDraftState>(initialQuickDraft);
  const [quickDraftMessage, setQuickDraftMessage] = useState<string | null>(null);
  const [isDraftSubmitting, setIsDraftSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setErrorMessage(null);

        const [users, roles, permissions, dashboardSummary] = await Promise.all([
          callAdminApi<AdminUser[]>("/api/v1/admin/users"),
          callAdminApi<AdminRole[]>("/api/v1/admin/roles"),
          callAdminApi<AdminPermission[]>("/api/v1/admin/permissions"),
          fetchAdminDashboardSummary(),
        ]);

        setState({
          users,
          roles,
          permissions,
          dashboardSummary,
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

  const catalogSummary = state?.dashboardSummary.catalog;
  const pipelineRows = useMemo(
    () => state?.dashboardSummary.pipeline ?? [],
    [state?.dashboardSummary.pipeline],
  );
  const readinessChecks = state?.dashboardSummary.readiness ?? [];

  const uploadPipelineCount = useMemo(() => {
    const uploadQueue = pipelineRows.find((row) => row.queue.toLowerCase().includes("upload"));
    return uploadQueue?.count ?? 0;
  }, [pipelineRows]);

  const stats = [
    {
      title: "Total Users",
      value: state?.users.length ?? 0,
      subtitle: `${activeAdmins} active admin/member accounts`,
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Catalog Titles",
      value: catalogSummary?.totalTitles ?? 0,
      subtitle: `${catalogSummary?.scheduled ?? 0} scheduled for release`,
      icon: Clapperboard,
      href: "/admin/content",
    },
    {
      title: "Upload Queue",
      value: uploadPipelineCount,
      subtitle: "Items being processed",
      icon: CloudUpload,
      href: "/admin/upload",
    },
    {
      title: "Subscription Plans",
      value: 4,
      subtitle: "Plan and entitlement templates",
      icon: CreditCard,
      href: "/admin/subscriptions",
    },
    {
      title: "Ticket Offers",
      value: catalogSummary?.openTickets ?? 0,
      subtitle: `${catalogSummary?.hybridAccessTitles ?? 0} hybrid access titles`,
      icon: Ticket,
      href: "/admin/tickets",
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

  const quickActions = [
    {
      label: "Open Content Library",
      description: "Browse drafts, published titles, and scheduling windows.",
      href: "/admin/content",
    },
    {
      label: "Launch Upload Studio",
      description: "Prepare source video, thumbnail, metadata, and access policy.",
      href: "/admin/upload",
    },
    {
      label: "Configure Ticket Offers",
      description: "Create fixed-expiry ticket access campaigns.",
      href: "/admin/tickets",
    },
  ];

  const handleQuickDraftSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!quickDraft.title.trim()) {
      setQuickDraftMessage("Add a title name before creating a draft.");
      return;
    }

    if (!quickDraft.thumbnailUrl.trim()) {
      setQuickDraftMessage("Add a thumbnail URL to prepare the draft.");
      return;
    }

    try {
      setIsDraftSubmitting(true);
      setQuickDraftMessage(null);

      await createAdminContentDraft({
        title: quickDraft.title,
        accessMode: quickDraft.accessMode,
      });

      const summary = await fetchAdminDashboardSummary();
      setState((previous) => (previous ? { ...previous, dashboardSummary: summary } : previous));
      setQuickDraft(initialQuickDraft);
      setQuickDraftMessage(
        `Draft created for ${quickDraft.title}. Continue in Upload Studio to finish metadata and publishing setup.`,
      );
    } catch (error) {
      setQuickDraftMessage(error instanceof Error ? error.message : "Failed to create draft blueprint.");
    } finally {
      setIsDraftSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ott-text-muted">Operations Console</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-ott-text-primary">Admin Dashboard</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-ott-text-secondary">
          Command center for content operations, upload readiness, monetization controls, and access policy.
        </p>
      </div>

      {errorMessage ? (
        <Card className="border border-red-500/30 bg-red-500/10">
          <CardContent className="pt-4 text-sm text-red-200">{errorMessage}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  <CardTitle className="font-heading text-4xl font-semibold tracking-tight">{item.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-ott-text-secondary">{item.subtitle}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Pipeline Board</CardTitle>
            <CardDescription>
              Track upload, release, and ticket operations from one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Queue</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipelineRows.map((row) => (
                  <TableRow key={row.queue}>
                    <TableCell>{row.queue}</TableCell>
                    <TableCell>{row.count}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-ott-border-soft text-ott-text-secondary">
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {pipelineRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-ott-text-muted">
                      No pipeline data available.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Readiness Radar</CardTitle>
            <CardDescription>Snapshot of core systems required for flexible OTT delivery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {readinessChecks.map((check) => (
              <Progress key={check.label} value={check.percent}>
                <ProgressLabel>{check.label}</ProgressLabel>
                <ProgressValue>{(_, value) => `${value ?? check.percent}%`}</ProgressValue>
              </Progress>
            ))}
            {readinessChecks.length === 0 ? (
              <p className="text-sm text-ott-text-muted">No readiness metrics available.</p>
            ) : null}
            <div className="rounded-lg border border-ott-border-soft bg-background/40 p-3 text-xs text-ott-text-secondary">
              Next milestone: enable draft-to-upload handoff with validation and entitlement presets.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Quick Draft Intake</CardTitle>
            <CardDescription>
              Prepare title, thumbnail, and access mode before entering Upload Studio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleQuickDraftSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quick-title">Title</Label>
                  <Input
                    id="quick-title"
                    placeholder="Shadow City: Final Cut"
                    value={quickDraft.title}
                    onChange={(event) =>
                      setQuickDraft((previous) => ({ ...previous, title: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quick-thumbnail">Thumbnail URL</Label>
                  <Input
                    id="quick-thumbnail"
                    placeholder="https://cdn.dristy.local/thumbnail.jpg"
                    value={quickDraft.thumbnailUrl}
                    onChange={(event) =>
                      setQuickDraft((previous) => ({ ...previous, thumbnailUrl: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quick-access">Access Mode</Label>
                <Select
                  value={quickDraft.accessMode}
                  onValueChange={(value) =>
                    setQuickDraft((previous) => ({
                      ...previous,
                      accessMode: (value as AccessMode | null) ?? previous.accessMode,
                    }))
                  }
                >
                  <SelectTrigger id="quick-access" className="w-full border-ott-border-soft">
                    <SelectValue placeholder="Select access mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">Subscription only</SelectItem>
                    <SelectItem value="ticket">Ticket only</SelectItem>
                    <SelectItem value="hybrid">Subscription or Ticket</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {quickDraftMessage ? (
                <p className="text-sm text-emerald-500">{quickDraftMessage}</p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" className="ott-gradient-cta text-white" disabled={isDraftSubmitting}>
                  {isDraftSubmitting ? "Creating..." : "Create Draft Blueprint"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-ott-border-soft"
                  onClick={() => router.push("/admin/upload")}
                >
                  Continue to Upload Studio
                  <ArrowRight className="ml-1 size-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Quick Operations</CardTitle>
            <CardDescription>Fast routes for daily admin workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.href}
                type="button"
                className="w-full rounded-lg border border-ott-border-soft bg-background/55 p-3 text-left transition-colors hover:bg-background/80"
                onClick={() => router.push(action.href)}
              >
                <p className="text-sm font-medium text-ott-text-primary">{action.label}</p>
                <p className="mt-1 text-xs text-ott-text-secondary">{action.description}</p>
              </button>
            ))}

            <div className="rounded-lg border border-ott-border-soft bg-background/40 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-ott-text-muted">Access Matrix</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-ott-border-soft text-ott-text-secondary">
                  Subscription
                </Badge>
                <Badge variant="outline" className="border-ott-border-soft text-ott-text-secondary">
                  Ticket
                </Badge>
                <Badge variant="outline" className="border-ott-border-soft text-ott-text-secondary">
                  Hybrid Unlock
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>System Roles Snapshot</CardTitle>
          <CardDescription>Quick visibility of active role definitions and permission load.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
          <div className="flex items-center gap-2 text-sm text-ott-text-secondary">
            <BarChart3 className="size-4" />
            Permission-aware navigation is now grouped by operations, content, monetization, and security.
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
