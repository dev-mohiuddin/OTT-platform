import bcrypt from "bcryptjs";

import type { ServerEnv } from "@/config/env/server-env";
import { createDatabaseId } from "@/lib/db/id";
import type { DatabaseClient, DatabaseCollections } from "@/lib/db/client";

const permissionSeed = [
  {
    key: "admin.panel.access",
    label: "Admin Panel Access",
    description: "Can access admin dashboard routes.",
  },
  {
    key: "admin.users.read",
    label: "Read Users",
    description: "Can view users and admin accounts.",
  },
  {
    key: "admin.users.create",
    label: "Create Admin Users",
    description: "Can create new admin users.",
  },
  {
    key: "admin.users.update",
    label: "Update User Roles",
    description: "Can assign and revoke user roles.",
  },
  {
    key: "admin.roles.read",
    label: "Read Roles",
    description: "Can view available roles.",
  },
  {
    key: "admin.roles.create",
    label: "Create Roles",
    description: "Can create custom roles.",
  },
  {
    key: "admin.permissions.read",
    label: "Read Permissions",
    description: "Can view permission catalog.",
  },
  {
    key: "admin.permissions.create",
    label: "Create Permissions",
    description: "Can create custom permissions.",
  },
  {
    key: "admin.audit.read",
    label: "Read Audit Logs",
    description: "Can review admin audit log entries.",
  },
] as const;

const roleSeed = [
  {
    slug: "user",
    name: "User",
    description: "Default end-user role.",
    isSystem: true,
    permissions: [] as string[],
  },
  {
    slug: "co-admin",
    name: "Co Admin",
    description: "Operational admin with read-heavy privileges.",
    isSystem: true,
    permissions: [
      "admin.panel.access",
      "admin.users.read",
      "admin.roles.read",
      "admin.permissions.read",
    ],
  },
  {
    slug: "super-admin",
    name: "Super Admin",
    description: "Highest privilege role with full platform access.",
    isSystem: true,
    permissions: permissionSeed.map((entry) => entry.key),
  },
] as const;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function upsertPermissions(collections: DatabaseCollections): Promise<void> {
  const now = new Date();

  for (const permission of permissionSeed) {
    await collections.permissions.updateOne(
      { key: permission.key },
      {
        $set: {
          label: permission.label,
          description: permission.description,
          updatedAt: now,
        },
        $setOnInsert: {
          id: createDatabaseId(),
          key: permission.key,
          createdAt: now,
        },
      },
      { upsert: true },
    );
  }
}

async function syncRolePermissions(
  collections: DatabaseCollections,
  roleSlug: string,
  permissionKeys: readonly string[],
): Promise<void> {
  const role = await collections.roles.findOne(
    { slug: roleSlug },
    { projection: { _id: 0, id: 1 } },
  );

  if (!role) {
    return;
  }

  const permissions = await collections.permissions.find({
    key: {
      $in: [...permissionKeys],
    },
  }).project({ _id: 0, id: 1 }).toArray();

  await collections.rolePermissions.deleteMany({ roleId: role.id });

  if (permissions.length === 0) {
    return;
  }

  await collections.rolePermissions.insertMany(
    permissions.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
      createdAt: new Date(),
    })),
    { ordered: false },
  );
}

async function upsertRoles(collections: DatabaseCollections): Promise<void> {
  const now = new Date();

  for (const role of roleSeed) {
    await collections.roles.updateOne(
      { slug: role.slug },
      {
        $set: {
          name: role.name,
          description: role.description,
          isSystem: role.isSystem,
          updatedAt: now,
        },
        $setOnInsert: {
          id: createDatabaseId(),
          slug: role.slug,
          createdAt: now,
        },
      },
      { upsert: true },
    );

    await syncRolePermissions(collections, role.slug, role.permissions);
  }
}

async function upsertSuperAdmin(collections: DatabaseCollections, env: ServerEnv): Promise<boolean> {
  const superAdminEmail = normalizeEmail(env.SUPER_ADMIN_EMAIL);
  const superAdminPassword = env.SUPER_ADMIN_PASSWORD;

  const superAdminRole = await collections.roles.findOne(
    { slug: "super-admin" },
    { projection: { _id: 0, id: 1 } },
  );

  if (!superAdminRole) {
    throw new Error("Super admin role was not found during bootstrap.");
  }

  const existingSuperAdmin = await collections.users.findOne(
    { email: superAdminEmail },
    { projection: { _id: 0, id: 1 } },
  );

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
    const now = new Date();

    await collections.users.insertOne({
      id: createDatabaseId(),
      name: "Super Admin",
      email: superAdminEmail,
      isActive: true,
      emailVerified: now,
      passwordHash: hashedPassword,
      phoneVerified: false,
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    });

    const createdSuperAdmin = await collections.users.findOne(
      { email: superAdminEmail },
      { projection: { _id: 0, id: 1 } },
    );

    if (!createdSuperAdmin) {
      throw new Error("Super admin user was not found after bootstrap.");
    }

    await collections.adminAuditLogs.insertOne({
      id: createDatabaseId(),
      actorId: createdSuperAdmin.id,
      action: "seed.super_admin.upsert",
      targetType: "user",
      targetId: createdSuperAdmin.id,
      metadata: {
        email: superAdminEmail,
      },
      createdAt: now,
    });
  }

  const superAdmin = await collections.users.findOne(
    { email: superAdminEmail },
    { projection: { _id: 0, id: 1 } },
  );

  if (!superAdmin) {
    throw new Error("Super admin user was not found after bootstrap.");
  }

  const now = new Date();

  await collections.userRoles.updateOne(
    {
      userId: superAdmin.id,
      roleId: superAdminRole.id,
    },
    {
      $set: {
        assignedById: superAdmin.id,
        assignedAt: now,
      },
      $setOnInsert: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    },
    { upsert: true },
  );

  return !existingSuperAdmin;
}

export async function seedDefaultAuthData(
  dbClient: DatabaseClient,
  env: ServerEnv,
): Promise<{ createdSuperAdmin: boolean }> {
  await upsertPermissions(dbClient.collections);
  await upsertRoles(dbClient.collections);

  const createdSuperAdmin = await upsertSuperAdmin(dbClient.collections, env);
  return { createdSuperAdmin };
}
