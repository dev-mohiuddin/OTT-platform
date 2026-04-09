import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db/client";

export async function listPermissions() {
  return db.permission.findMany({
    orderBy: {
      key: "asc",
    },
  });
}

export async function createPermission(input: {
  key: string;
  label: string;
  description?: string;
}) {
  return db.permission.create({
    data: {
      key: input.key,
      label: input.label,
      description: input.description,
    },
  });
}

export async function listRolesWithPermissions() {
  return db.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
    orderBy: {
      slug: "asc",
    },
  });
}

export async function getRoleBySlug(slug: string) {
  return db.role.findUnique({
    where: { slug },
  });
}

export async function createRole(input: {
  name: string;
  slug: string;
  description?: string;
  isSystem?: boolean;
}) {
  return db.role.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      isSystem: input.isSystem ?? false,
    },
  });
}

export async function findPermissionsByKeys(keys: readonly string[]) {
  return db.permission.findMany({
    where: {
      key: {
        in: [...keys],
      },
    },
  });
}

export async function replaceRolePermissions(roleId: string, permissionIds: readonly string[]) {
  await db.rolePermission.deleteMany({
    where: {
      roleId,
    },
  });

  if (permissionIds.length === 0) {
    return;
  }

  await db.rolePermission.createMany({
    data: permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    })),
  });
}

export async function listUsersWithRoles() {
  return db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function assignRoleToUser(
  userId: string,
  roleId: string,
  assignedById: string,
) {
  return db.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId,
      },
    },
    update: {
      assignedById,
      assignedAt: new Date(),
    },
    create: {
      userId,
      roleId,
      assignedById,
    },
  });
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  return db.userRole.delete({
    where: {
      userId_roleId: {
        userId,
        roleId,
      },
    },
  });
}

export async function findUserById(userId: string) {
  return db.user.findUnique({
    where: {
      id: userId,
    },
  });
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

export async function createAdminAuditLog(input: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return db.adminAuditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata,
    },
  });
}
