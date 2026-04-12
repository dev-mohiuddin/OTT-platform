"use client";

import { useEffect, useMemo, useState } from "react";

import { fetchAdminAuditLogEvents } from "@/components/ott/admin/api";
import type { AdminAuditLogEvent } from "@/components/ott/admin/types";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminAuditLogPanel() {
  const [events, setEvents] = useState<AdminAuditLogEvent[]>([]);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setErrorMessage(null);
        const data = await fetchAdminAuditLogEvents();
        setEvents(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load audit logs.");
      }
    }

    void loadEvents();
  }, []);

  const filteredRows = useMemo(() => {
    return events.filter((row) => {
      const normalized = search.toLowerCase();
      return (
        row.actor.toLowerCase().includes(normalized)
        || row.action.toLowerCase().includes(normalized)
        || row.target.toLowerCase().includes(normalized)
      );
    });
  }, [events, search]);

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-ott-text-primary">Audit Logs</h1>
        <p className="text-sm text-ott-text-secondary">
          Trace who changed what, where, and when across admin operations.
        </p>
      </div>

      {errorMessage ? (
        <Card className="border border-red-500/30 bg-red-500/10">
          <CardContent className="pt-4 text-sm text-red-200">{errorMessage}</CardContent>
        </Card>
      ) : null}

      <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Event Explorer</CardTitle>
          <CardDescription>
            Search by actor, action, or target identifier.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audit-search">Search logs</Label>
            <Input
              id="audit-search"
              placeholder="ops@dristy.com or content.publish"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-ott-text-secondary">{row.actor}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-ott-border-soft text-ott-text-secondary">
                      {row.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-ott-text-secondary">{row.target}</TableCell>
                  <TableCell className="text-ott-text-secondary">{row.at}</TableCell>
                </TableRow>
              ))}

              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-ott-text-muted">
                    No audit events found for this query.
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
