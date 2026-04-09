"use client";

import { useEffect, useState } from "react";

import { callAdminApi } from "@/components/ott/admin/api";
import type { AdminPermission } from "@/components/ott/admin/types";
import { Button } from "@/components/ui/button";
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

interface PermissionForm {
  key: string;
  label: string;
  description: string;
}

const initialForm: PermissionForm = {
  key: "",
  label: "",
  description: "",
};

export function AdminPermissionsPanel() {
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [form, setForm] = useState<PermissionForm>(initialForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPermissions = async () => {
    try {
      setErrorMessage(null);
      const data = await callAdminApi<AdminPermission[]>("/api/v1/admin/permissions");
      setPermissions(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load permissions.");
    }
  };

  useEffect(() => {
    void loadPermissions();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await callAdminApi<AdminPermission>("/api/v1/admin/permissions", {
        method: "POST",
        body: {
          key: form.key,
          label: form.label,
          description: form.description || undefined,
        },
      });

      setForm(initialForm);
      setSuccessMessage("Permission created successfully.");
      await loadPermissions();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create permission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-ott-text-primary">Permissions</h1>
        <p className="text-sm text-ott-text-secondary">
          Define reusable permission keys and labels for role access control.
        </p>
      </div>

      <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Create Permission</CardTitle>
          <CardDescription>Add a new permission key for RBAC policy mapping.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="permission-key">Permission Key</Label>
              <Input
                id="permission-key"
                value={form.key}
                onChange={(event) => setForm((previous) => ({ ...previous, key: event.target.value }))}
                placeholder="admin.reports.read"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="permission-label">Label</Label>
              <Input
                id="permission-label"
                value={form.label}
                onChange={(event) => setForm((previous) => ({ ...previous, label: event.target.value }))}
                placeholder="Read Reports"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="permission-description">Description</Label>
              <Input
                id="permission-description"
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, description: event.target.value }))
                }
                placeholder="Can access reporting dashboard and metrics."
              />
            </div>

            {successMessage ? <p className="md:col-span-2 text-sm text-emerald-500">{successMessage}</p> : null}
            {errorMessage ? <p className="md:col-span-2 text-sm text-red-500">{errorMessage}</p> : null}

            <div className="md:col-span-2">
              <Button type="submit" className="ott-gradient-cta text-white" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Permission"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Permission Catalog</CardTitle>
          <CardDescription>{permissions.length} permissions configured</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-mono text-xs">{permission.key}</TableCell>
                  <TableCell>{permission.label}</TableCell>
                  <TableCell className="text-ott-text-secondary">
                    {permission.description || "-"}
                  </TableCell>
                </TableRow>
              ))}
              {permissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-ott-text-muted">
                    No permissions found.
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
