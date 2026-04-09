"use client";

import { useEffect, useMemo, useState } from "react";

import { callAdminApi } from "@/components/ott/admin/api";
import type { AdminRole, AdminUser } from "@/components/ott/admin/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

interface CreateAdminUserForm {
  fullName: string;
  email: string;
  password: string;
  roleSlugs: string[];
}

const initialCreateForm: CreateAdminUserForm = {
  fullName: "",
  email: "",
  password: "",
  roleSlugs: [],
};

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [createForm, setCreateForm] = useState<CreateAdminUserForm>(initialCreateForm);
  const [selectedRoleByUser, setSelectedRoleByUser] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);

  const roleOptions = useMemo(
    () => roles.filter((role) => role.slug !== "user"),
    [roles],
  );

  const loadData = async () => {
    try {
      setErrorMessage(null);

      const [usersData, rolesData] = await Promise.all([
        callAdminApi<AdminUser[]>("/api/v1/admin/users"),
        callAdminApi<AdminRole[]>("/api/v1/admin/roles"),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load users.");
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const toggleCreateRole = (roleSlug: string, checked: boolean) => {
    setCreateForm((previous) => ({
      ...previous,
      roleSlugs: checked
        ? [...previous.roleSlugs, roleSlug]
        : previous.roleSlugs.filter((slug) => slug !== roleSlug),
    }));
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (createForm.roleSlugs.length === 0) {
      setErrorMessage("Select at least one role for the admin account.");
      return;
    }

    setIsCreating(true);

    try {
      await callAdminApi("/api/v1/admin/users", {
        method: "POST",
        body: createForm,
      });

      setCreateForm(initialCreateForm);
      setSuccessMessage("Admin user created successfully.");
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create admin user.");
    } finally {
      setIsCreating(false);
    }
  };

  const updateRoleAssignment = async (userId: string, mode: "assign" | "remove") => {
    const roleSlug = selectedRoleByUser[userId];
    if (!roleSlug) {
      setErrorMessage("Select a role before updating assignment.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUpdatingRole(userId);

    try {
      await callAdminApi(`/api/v1/admin/users/${userId}/roles`, {
        method: mode === "assign" ? "POST" : "DELETE",
        body: {
          roleSlug,
        },
      });

      setSuccessMessage(mode === "assign" ? "Role assigned successfully." : "Role removed successfully.");
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update role assignment.");
    } finally {
      setIsUpdatingRole(null);
    }
  };

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-ott-text-primary">Users</h1>
        <p className="text-sm text-ott-text-secondary">
          Create admin members and manage role assignments for platform access.
        </p>
      </div>

      <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Create Admin User</CardTitle>
          <CardDescription>
            New admin accounts are created with must-change-password enabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreateUser}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="admin-full-name">Full Name</Label>
                <Input
                  id="admin-full-name"
                  value={createForm.fullName}
                  onChange={(event) =>
                    setCreateForm((previous) => ({ ...previous, fullName: event.target.value }))
                  }
                  placeholder="Operations Manager"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={createForm.email}
                  onChange={(event) =>
                    setCreateForm((previous) => ({ ...previous, email: event.target.value }))
                  }
                  placeholder="ops@dristy.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Temporary Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={createForm.password}
                  onChange={(event) =>
                    setCreateForm((previous) => ({ ...previous, password: event.target.value }))
                  }
                  placeholder="Strong temporary password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Initial Roles</Label>
              <div className="grid gap-2 md:grid-cols-3">
                {roleOptions.map((role) => (
                  <Label key={role.id} htmlFor={`new-role-${role.id}`} className="rounded-md border border-ott-border-soft p-2 text-sm">
                    <Checkbox
                      id={`new-role-${role.id}`}
                      checked={createForm.roleSlugs.includes(role.slug)}
                      onCheckedChange={(checked) => toggleCreateRole(role.slug, Boolean(checked))}
                    />
                    <span>{role.name}</span>
                  </Label>
                ))}
              </div>
            </div>

            {successMessage ? <p className="text-sm text-emerald-500">{successMessage}</p> : null}
            {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

            <Button type="submit" className="ott-gradient-cta text-white" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Admin User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Users & Assignments</CardTitle>
          <CardDescription>{users.length} users available for role mapping</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Identifier</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Assignment Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{user.name ?? "Unnamed User"}</p>
                      <p className="text-xs text-ott-text-muted">{user.isActive ? "Active" : "Inactive"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-ott-text-secondary">
                    {user.email ?? user.phone ?? "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((membership) => (
                        <Badge key={`${user.id}-${membership.roleId}`} variant="outline" className="border-ott-border-soft text-ott-text-secondary">
                          {membership.role.slug}
                        </Badge>
                      ))}
                      {user.roles.length === 0 ? (
                        <span className="text-sm text-ott-text-muted">No roles</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        className="h-9 min-w-36 rounded-md border border-ott-border-soft bg-background px-2 text-sm"
                        value={selectedRoleByUser[user.id] ?? ""}
                        onChange={(event) =>
                          setSelectedRoleByUser((previous) => ({
                            ...previous,
                            [user.id]: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select role</option>
                        {roleOptions.map((role) => (
                          <option key={role.id} value={role.slug}>
                            {role.slug}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-ott-border-soft"
                        onClick={() => void updateRoleAssignment(user.id, "assign")}
                        disabled={isUpdatingRole === user.id}
                      >
                        Assign
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-ott-border-soft"
                        onClick={() => void updateRoleAssignment(user.id, "remove")}
                        disabled={isUpdatingRole === user.id}
                      >
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-ott-text-muted">
                    No users found.
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
