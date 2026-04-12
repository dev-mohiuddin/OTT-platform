import bcrypt from "bcryptjs";

import { getServerEnv } from "../src/config/env/server-env";
import { db } from "../src/lib/db/client";
import { createDatabaseId } from "../src/lib/db/id";

const env = getServerEnv(process.env);

if (!env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required to run MongoDB seed.");
}

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

async function upsertPermissions() {
  const now = new Date();

  for (const permission of permissionSeed) {
    await db.collections.permissions.updateOne(
      {
        key: permission.key,
      },
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
      {
        upsert: true,
      },
    );
  }
}

async function syncRolePermissions(roleSlug: string, permissionKeys: readonly string[]) {
  const role = await db.collections.roles.findOne(
    { slug: roleSlug },
    { projection: { _id: 0, id: 1 } },
  );

  if (!role) {
    return;
  }

  const permissions = await db.collections.permissions.find({
    key: {
      $in: [...permissionKeys],
    },
  }).project({ _id: 0, id: 1 }).toArray();

  await db.collections.rolePermissions.deleteMany({ roleId: role.id });

  if (permissions.length === 0) {
    return;
  }

  await db.collections.rolePermissions.insertMany(
    permissions.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
      createdAt: new Date(),
    })),
    {
      ordered: false,
    },
  );
}

async function upsertRoles() {
  const now = new Date();

  for (const role of roleSeed) {
    await db.collections.roles.updateOne(
      {
        slug: role.slug,
      },
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
      {
        upsert: true,
      },
    );

    await syncRolePermissions(role.slug, role.permissions);
  }
}

async function upsertSuperAdmin() {
  const superAdminEmail = env.SUPER_ADMIN_EMAIL ?? "admin@admin.com";
  const superAdminPassword = env.SUPER_ADMIN_PASSWORD ?? "12345678";

  const superAdminRole = await db.collections.roles.findOne(
    { slug: "super-admin" },
    { projection: { _id: 0, id: 1 } },
  );

  if (!superAdminRole) {
    throw new Error("Super admin role was not found during seed.");
  }

  const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

  const now = new Date();

  await db.collections.users.updateOne(
    {
      email: superAdminEmail,
    },
    {
      $set: {
        name: "Super Admin",
        email: superAdminEmail,
        isActive: true,
        emailVerified: now,
        passwordHash: hashedPassword,
        phoneVerified: false,
        mustChangePassword: true,
        updatedAt: now,
      },
      $setOnInsert: {
        id: createDatabaseId(),
        createdAt: now,
      },
    },
    {
      upsert: true,
    },
  );

  const superAdmin = await db.collections.users.findOne(
    { email: superAdminEmail },
    { projection: { _id: 0, id: 1 } },
  );

  if (!superAdmin) {
    throw new Error("Super admin user was not found after upsert.");
  }

  await db.collections.userRoles.updateOne(
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
    {
      upsert: true,
    },
  );

  await db.collections.adminAuditLogs.insertOne({
    id: createDatabaseId(),
    actorId: superAdmin.id,
    action: "seed.super_admin.upsert",
    targetType: "user",
    targetId: superAdmin.id,
    metadata: {
      email: superAdminEmail,
    },
    createdAt: now,
  });
}

async function main() {
  await upsertPermissions();
  await upsertRoles();
  await upsertSuperAdmin();
}

main()
  .then(async () => {
    await db.client.close();
  })
  .catch(async (error) => {
    console.error("MongoDB seed failed:", error);
    await db.client.close();
    process.exit(1);
  });