import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { getServerEnv } from "../src/config/env/server-env";

const env = getServerEnv(process.env);

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run Prisma seed.");
}

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

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
  for (const permission of permissionSeed) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        label: permission.label,
        description: permission.description,
      },
      create: {
        key: permission.key,
        label: permission.label,
        description: permission.description,
      },
    });
  }
}

async function syncRolePermissions(roleSlug: string, permissionKeys: readonly string[]) {
  const role = await prisma.role.findUnique({ where: { slug: roleSlug } });
  if (!role) {
    return;
  }

  const permissions = await prisma.permission.findMany({
    where: {
      key: {
        in: [...permissionKeys],
      },
    },
    select: {
      id: true,
    },
  });

  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

  if (permissions.length === 0) {
    return;
  }

  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
    })),
  });
}

async function upsertRoles() {
  for (const role of roleSeed) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
      },
      create: {
        slug: role.slug,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
      },
    });

    await syncRolePermissions(role.slug, role.permissions);
  }
}

async function upsertSuperAdmin() {
  const superAdminEmail = env.SUPER_ADMIN_EMAIL ?? "admin@admin.com";
  const superAdminPassword = env.SUPER_ADMIN_PASSWORD ?? "12345678";

  const superAdminRole = await prisma.role.findUnique({
    where: { slug: "super-admin" },
  });

  if (!superAdminRole) {
    throw new Error("Super admin role was not found during seed.");
  }

  const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      name: "Super Admin",
      isActive: true,
      emailVerified: new Date(),
      passwordHash: hashedPassword,
      mustChangePassword: true,
    },
    create: {
      name: "Super Admin",
      email: superAdminEmail,
      isActive: true,
      emailVerified: new Date(),
      passwordHash: hashedPassword,
      mustChangePassword: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    },
    update: {
      assignedById: superAdmin.id,
    },
    create: {
      userId: superAdmin.id,
      roleId: superAdminRole.id,
      assignedById: superAdmin.id,
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: superAdmin.id,
      action: "seed.super_admin.upsert",
      targetType: "user",
      targetId: superAdmin.id,
      metadata: {
        email: superAdminEmail,
      },
    },
  });
}

async function main() {
  await upsertPermissions();
  await upsertRoles();
  await upsertSuperAdmin();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Prisma seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
