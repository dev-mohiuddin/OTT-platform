"use client";

import { useEffect, useState } from "react";

import { callAdminApi } from "@/components/ott/admin/api";
import type { AdminPermission, AdminRole } from "@/components/ott/admin/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RoleForm {
  name: string;
  slug: string;
  description: string;
  permissionKeys: string[];
}

const initialRoleForm: RoleForm = {
  name: "",
  slug: "",
  description: "",
  permissionKeys: [],
};

export function AdminRolesPanel() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [form, setForm] = useState<RoleForm>(initialRoleForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setErrorMessage(null);

      const [roleData, permissionData] = await Promise.all([
        callAdminApi<AdminRole[]>("/api/v1/admin/roles"),
        callAdminApi<AdminPermission[]>("/api/v1/admin/permissions"),
      ]);

      setRoles(roleData);
      setPermissions(permissionData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load roles.");
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const togglePermissionSelection = (permissionKey: string, checked: boolean) => {
    setForm((previous) => ({
      ...previous,
      permissionKeys: checked
        ? [...previous.permissionKeys, permissionKey]
        : previous.permissionKeys.filter((key) => key !== permissionKey),
    }));
  };

  const handleCreateRole = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await callAdminApi<AdminRole>("/api/v1/admin/roles", {
        method: "POST",
        body: {
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
          permissionKeys: form.permissionKeys,
        },
      });

      setForm(initialRoleForm);
      setSuccessMessage("Role created successfully.");
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-ott-text-primary">Roles</h1>
        <p className="text-sm text-ott-text-secondary">
          Configure role groups and map the permission keys each role can access.
        </p>
      </div>

      <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Create Role</CardTitle>
          <CardDescription>Define a new role and assign permission scope.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreateRole}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={form.name}
                  onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder="Content Manager"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-slug">Role Slug</Label>
                <Input
                  id="role-slug"
                  value={form.slug}
                  onChange={(event) => setForm((previous) => ({ ...previous, slug: event.target.value }))}
                  placeholder="content-manager"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Input
                id="role-description"
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, description: event.target.value }))
                }
                placeholder="Can manage editorial and scheduling workflows."
              />
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {permissions.map((permission) => (
                  <Label
                    key={permission.id}
                    htmlFor={`permission-${permission.id}`}
                    className="rounded-md border border-ott-border-soft p-2 text-sm"
                  >
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={form.permissionKeys.includes(permission.key)}
                      onCheckedChange={(checked) =>
                        togglePermissionSelection(permission.key, Boolean(checked))
                      }
                    />
                    <span>
                      {permission.label}
                      <span className="block text-xs text-ott-text-muted">{permission.key}</span>
                    </span>
                  </Label>
                ))}
              </div>
            </div>

            {successMessage ? <p className="text-sm text-emerald-500">{successMessage}</p> : null}
            {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

            <Button type="submit" className="ott-gradient-cta text-white" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Role"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.id} className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>{role.name}</span>
                <Badge variant={role.isSystem ? "default" : "outline"}>
                  {role.isSystem ? "System" : "Custom"}
                </Badge>
              </CardTitle>
              <CardDescription>{role.description || role.slug}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs uppercase tracking-[0.14em] text-ott-text-muted">
                Permission Keys ({role.permissions.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((rolePermission) => (
                  <Badge key={rolePermission.permissionId} variant="outline" className="border-ott-border-soft text-ott-text-secondary">
                    {rolePermission.permission.key}
                  </Badge>
                ))}
                {role.permissions.length === 0 ? (
                  <span className="text-sm text-ott-text-muted">No permissions mapped.</span>
                ) : null}
              </div>
              <p className="text-sm text-ott-text-secondary">
                Assigned users: {role._count?.users ?? 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
