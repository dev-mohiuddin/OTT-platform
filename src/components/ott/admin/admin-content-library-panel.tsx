"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createAdminContentDraft,
  fetchAdminContentCatalog,
  updateAdminContentDraft,
} from "@/components/ott/admin/api";
import type {
  AdminAccessMode,
  AdminContentCatalog,
  AdminContentFormat,
  AdminContentItem,
  AdminContentStatus,
} from "@/components/ott/admin/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function getStatusClassName(status: AdminContentStatus): string {
  switch (status) {
    case "published":
      return "border-emerald-500/40 text-emerald-500";
    case "scheduled":
      return "border-blue-500/40 text-blue-500";
    case "archived":
      return "border-zinc-500/40 text-zinc-500";
    default:
      return "border-amber-500/40 text-amber-500";
  }
}

function getAccessClassName(mode: AdminAccessMode): string {
  switch (mode) {
    case "subscription":
      return "border-violet-500/40 text-violet-500";
    case "ticket":
      return "border-orange-500/40 text-orange-500";
    default:
      return "border-cyan-500/40 text-cyan-500";
  }
}

function getNextLifecycleStatus(status: AdminContentStatus): AdminContentStatus | null {
  if (status === "draft") {
    return "scheduled";
  }

  if (status === "scheduled") {
    return "published";
  }

  return null;
}

export function AdminContentLibraryPanel() {
  const [catalog, setCatalog] = useState<AdminContentCatalog | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminContentStatus | "all">("all");
  const [accessFilter, setAccessFilter] = useState<AdminAccessMode | "all">("all");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftFormat, setDraftFormat] = useState<AdminContentFormat>("Movie");
  const [draftAccessMode, setDraftAccessMode] = useState<AdminAccessMode>("hybrid");
  const [draftQuality, setDraftQuality] = useState("1080p + 720p");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [updatingContentId, setUpdatingContentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setErrorMessage(null);
      const data = await fetchAdminContentCatalog();
      setCatalog(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load content catalog.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const handleCreateDraft = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draftTitle.trim()) {
      setActionMessage("Provide a title to create a new draft.");
      return;
    }

    try {
      setIsCreatingDraft(true);
      setErrorMessage(null);
      setActionMessage(null);

      const draft = await createAdminContentDraft({
        title: draftTitle.trim(),
        format: draftFormat,
        accessMode: draftAccessMode,
        quality: draftQuality.trim() || "1080p + 720p",
      });

      await loadCatalog();
      setDraftTitle("");
      setDraftFormat("Movie");
      setDraftAccessMode("hybrid");
      setDraftQuality("1080p + 720p");
      setActionMessage(`Draft ${draft.id} created for ${draft.title}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create content draft.");
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const handleAdvanceLifecycle = async (row: AdminContentItem) => {
    const nextStatus = getNextLifecycleStatus(row.status);

    if (!nextStatus) {
      return;
    }

    try {
      setUpdatingContentId(row.id);
      setErrorMessage(null);
      setActionMessage(null);

      await updateAdminContentDraft(row.id, {
        status: nextStatus,
        publishAt:
          nextStatus === "scheduled" && row.publishAt === "Unscheduled"
            ? "Next release window"
            : undefined,
      });

      await loadCatalog();
      setActionMessage(
        nextStatus === "scheduled"
          ? `${row.title} moved to scheduled queue.`
          : `${row.title} marked as published.`,
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update content status.");
    } finally {
      setUpdatingContentId(null);
    }
  };

  const filteredRows = useMemo(() => {
    const rows = catalog?.items ?? [];

    return rows.filter((row) => {
      const matchesSearch =
        row.title.toLowerCase().includes(search.toLowerCase())
        || row.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesAccess = accessFilter === "all" || row.accessMode === accessFilter;

      return matchesSearch && matchesStatus && matchesAccess;
    });
  }, [catalog, search, statusFilter, accessFilter]);

  const summary = catalog?.summary ?? {
    total: 0,
    drafts: 0,
    scheduled: 0,
    hybrid: 0,
  };

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-ott-text-primary">Content Library</h1>
        <p className="text-sm text-ott-text-secondary">
          Organize title inventory, publishing states, and access modes across your OTT catalog.
        </p>
      </div>

      {errorMessage ? (
        <Card className="border border-red-500/30 bg-red-500/10">
          <CardContent className="pt-4 text-sm text-red-200">{errorMessage}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardDescription>Total Titles</CardDescription>
            <CardTitle className="text-3xl font-semibold">{summary.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardDescription>Draft Pipeline</CardDescription>
            <CardTitle className="text-3xl font-semibold">{summary.drafts}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardDescription>Scheduled Drops</CardDescription>
            <CardTitle className="text-3xl font-semibold">{summary.scheduled}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardDescription>Hybrid Access Titles</CardDescription>
            <CardTitle className="text-3xl font-semibold">{summary.hybrid}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Draft Composer</CardTitle>
          <CardDescription>
            Create a draft entry before metadata and upload processing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 xl:grid-cols-[1.4fr_repeat(3,1fr)]" onSubmit={handleCreateDraft}>
            <div className="space-y-2 xl:col-span-1">
              <Label htmlFor="draft-title">Title</Label>
              <Input
                id="draft-title"
                placeholder="Shadow City: Final Cut"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="draft-format">Format</Label>
              <Select value={draftFormat} onValueChange={(value) => setDraftFormat(value as AdminContentFormat)}>
                <SelectTrigger id="draft-format" className="w-full border-ott-border-soft">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Movie">Movie</SelectItem>
                  <SelectItem value="Series">Series</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="draft-access">Access</Label>
              <Select
                value={draftAccessMode}
                onValueChange={(value) => setDraftAccessMode(value as AdminAccessMode)}
              >
                <SelectTrigger id="draft-access" className="w-full border-ott-border-soft">
                  <SelectValue placeholder="Select access mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="ticket">Ticket</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="draft-quality">Quality</Label>
              <Input
                id="draft-quality"
                value={draftQuality}
                onChange={(event) => setDraftQuality(event.target.value)}
              />
            </div>

            <div className="xl:col-span-4 flex flex-wrap items-center gap-2">
              <Button type="submit" className="ott-gradient-cta text-white" disabled={isCreatingDraft}>
                {isCreatingDraft ? "Creating..." : "Create Draft"}
              </Button>
              {actionMessage ? <p className="text-sm text-emerald-500">{actionMessage}</p> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Catalog Explorer</CardTitle>
          <CardDescription>
            Search and filter titles by lifecycle status and monetization access mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="content-search">Search</Label>
              <Input
                id="content-search"
                placeholder="Search by title or ID"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-status">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AdminContentStatus | "all") }>
                <SelectTrigger id="content-status" className="w-full border-ott-border-soft">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-access">Access Mode</Label>
              <Select value={accessFilter} onValueChange={(value) => setAccessFilter(value as AdminAccessMode | "all") }>
                <SelectTrigger id="content-access" className="w-full border-ott-border-soft">
                  <SelectValue placeholder="All access modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All access modes</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="ticket">Ticket</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              className="ott-gradient-cta text-white"
              disabled={isRefreshing}
              onClick={() => {
                void loadCatalog();
              }}
            >
              {isRefreshing ? "Refreshing..." : "Refresh Catalog"}
            </Button>
            <Button variant="outline" className="border-ott-border-soft">Bulk Metadata Import</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Publish At</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-ott-text-primary">{row.title}</p>
                      <p className="text-xs text-ott-text-muted">{row.id} · {row.format}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusClassName(row.status)}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getAccessClassName(row.accessMode)}>
                      {row.accessMode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-ott-text-secondary">{row.quality}</TableCell>
                  <TableCell className="text-ott-text-secondary">{row.publishAt}</TableCell>
                  <TableCell className="text-ott-text-secondary">{row.owner}</TableCell>
                  <TableCell>
                    {row.status === "draft" || row.status === "scheduled" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-ott-border-soft"
                        disabled={updatingContentId === row.id}
                        onClick={() => {
                          void handleAdvanceLifecycle(row);
                        }}
                      >
                        {updatingContentId === row.id
                          ? "Updating..."
                          : row.status === "draft"
                            ? "Mark Scheduled"
                            : "Mark Published"}
                      </Button>
                    ) : (
                      <span className="text-xs text-ott-text-muted">No action</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-ott-text-muted">
                    No content found with the selected filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
