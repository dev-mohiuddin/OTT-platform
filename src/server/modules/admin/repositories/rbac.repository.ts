import { invalidateUserAccessSnapshot, invalidateUsersAccessSnapshots } from "@/lib/auth/access";
import { db } from "@/lib/db/client";
import { createDatabaseId } from "@/lib/db/id";
import type {
  AdminAuditLogRecord,
  PermissionRecord,
  RolePermissionRecord,
  RoleRecord,
  UserRecord,
  UserRoleRecord,
} from "@/lib/db/types";

function withoutMongoId<T extends { _id?: unknown }>(record: T): Omit<T, "_id"> {
  const rest = { ...record } as T & { _id?: unknown };
  delete rest._id;

  return rest;
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

export async function listPermissions() {
  return db.collections.permissions.find(
    {},
    {
      projection: {
        _id: 0,
      },
    },
  ).sort({ key: 1 }).toArray();
}

export async function createPermission(input: {
  key: string;
  label: string;
  description?: string;
}) {
  const now = new Date();

  const permission: PermissionRecord = {
    id: createDatabaseId(),
    key: input.key,
    label: input.label,
    description: input.description ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.collections.permissions.insertOne(permission);
  return permission;
}

export async function listRolesWithPermissions() {
  const roles = await db.collections.roles.find(
    {},
    {
      projection: {
        _id: 0,
      },
    },
  ).sort({ slug: 1 }).toArray() as RoleRecord[];

  if (roles.length === 0) {
    return [];
  }

  const roleIds = roles.map((role) => role.id);
  const [rolePermissions, roleUserCounts] = await Promise.all([
    db.collections.rolePermissions.find(
      {
        roleId: {
          $in: roleIds,
        },
      },
      {
        projection: {
          _id: 0,
        },
      },
    ).toArray() as Promise<RolePermissionRecord[]>,
    db.collections.userRoles.aggregate<{ _id: string; users: number }>([
      {
        $match: {
          roleId: {
            $in: roleIds,
          },
        },
      },
      {
        $group: {
          _id: "$roleId",
          users: {
            $sum: 1,
          },
        },
      },
    ]).toArray(),
  ]);

  const permissionIds = unique(rolePermissions.map((item) => item.permissionId));
  const permissions = permissionIds.length === 0
    ? []
    : await db.collections.permissions.find(
      {
        id: {
          $in: permissionIds,
        },
      },
      {
        projection: {
          _id: 0,
        },
      },
    ).toArray() as PermissionRecord[];

  const permissionsById = new Map(permissions.map((permission) => [permission.id, permission]));
  const countByRoleId = new Map(roleUserCounts.map((entry) => [entry._id, entry.users]));

  return roles.map((role) => {
    const mappedPermissions = rolePermissions
      .filter((permissionLink) => permissionLink.roleId === role.id)
      .map((permissionLink) => {
        const permission = permissionsById.get(permissionLink.permissionId);
        if (!permission) {
          return null;
        }

        return {
          ...permissionLink,
          permission,
        };
      })
      .filter((value): value is RolePermissionRecord & { permission: PermissionRecord } => Boolean(value));

    return {
      ...role,
      permissions: mappedPermissions,
      _count: {
        users: countByRoleId.get(role.id) ?? 0,
      },
    };
  });
}

export async function getRoleBySlug(slug: string) {
  return db.collections.roles.findOne(
    { slug },
    {
      projection: {
        _id: 0,
      },
    },
  );
}

export async function createRole(input: {
  name: string;
  slug: string;
  description?: string;
  isSystem?: boolean;
}) {
  const now = new Date();

  const role: RoleRecord = {
    id: createDatabaseId(),
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    isSystem: input.isSystem ?? false,
    createdAt: now,
    updatedAt: now,
  };

  await db.collections.roles.insertOne(role);
  return role;
}

export async function findPermissionsByKeys(keys: readonly string[]) {
  return db.collections.permissions.find(
    {
      key: {
        $in: [...keys],
      },
    },
    {
      projection: {
        _id: 0,
      },
    },
  ).toArray();
}

export async function replaceRolePermissions(roleId: string, permissionIds: readonly string[]) {
  await db.collections.rolePermissions.deleteMany({ roleId });

  if (permissionIds.length === 0) {
    const affectedUsers = await db.collections.userRoles.find(
      { roleId },
      { projection: { _id: 0, userId: 1 } },
    ).toArray();

    await invalidateUsersAccessSnapshots(affectedUsers.map((membership) => membership.userId));
    return;
  }

  const now = new Date();

  await db.collections.rolePermissions.insertMany(
    permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
      createdAt: now,
    })),
    {
      ordered: false,
    },
  );

  const affectedUsers = await db.collections.userRoles.find(
    { roleId },
    { projection: { _id: 0, userId: 1 } },
  ).toArray();

  await invalidateUsersAccessSnapshots(affectedUsers.map((membership) => membership.userId));
}

export async function listUsersWithRoles() {
  const users = await db.collections.users.find(
    {},
    {
      projection: {
        _id: 0,
        id: 1,
        name: 1,
        email: 1,
        phone: 1,
        isActive: 1,
        createdAt: 1,
      },
    },
  ).sort({ createdAt: -1 }).toArray() as Array<
    Pick<UserRecord, "id" | "name" | "email" | "phone" | "isActive" | "createdAt">
  >;

  if (users.length === 0) {
    return [];
  }

  const userIds = users.map((user) => user.id);
  const userRoles = await db.collections.userRoles.find(
    {
      userId: {
        $in: userIds,
      },
    },
    {
      projection: {
        _id: 0,
      },
    },
  ).toArray() as UserRoleRecord[];

  const roleIds = unique(userRoles.map((membership) => membership.roleId));
  const roles = roleIds.length === 0
    ? []
    : await db.collections.roles.find(
      {
        id: {
          $in: roleIds,
        },
      },
      {
        projection: {
          _id: 0,
          id: 1,
          name: 1,
          slug: 1,
        },
      },
    ).toArray() as Array<Pick<RoleRecord, "id" | "name" | "slug">>;

  const roleById = new Map(roles.map((role) => [role.id, role]));

  return users.map((user) => {
    const memberships = userRoles
      .filter((membership) => membership.userId === user.id)
      .reduce<Array<UserRoleRecord & { role: Pick<RoleRecord, "id" | "name" | "slug"> }>>((accumulator, membership) => {
        const role = roleById.get(membership.roleId);
        if (!role) {
          return accumulator;
        }

        accumulator.push({
          ...membership,
          role,
        });

        return accumulator;
      }, []);

    return {
      ...user,
      roles: memberships,
    };
  });
}

export async function assignRoleToUser(
  userId: string,
  roleId: string,
  assignedById: string,
) {
  await db.collections.userRoles.updateOne({
    userId,
    roleId,
  }, {
    $set: {
      assignedById,
      assignedAt: new Date(),
    },
    $setOnInsert: {
      userId,
      roleId,
    },
  }, {
    upsert: true,
  });

  await invalidateUserAccessSnapshot(userId);

  return db.collections.userRoles.findOne(
    {
      userId,
      roleId,
    },
    {
      projection: {
        _id: 0,
      },
    },
  );
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  const deleted = await db.collections.userRoles.findOneAndDelete(
    {
      userId,
      roleId,
    },
    {
      projection: {
        _id: 0,
      },
    },
  );

  await invalidateUserAccessSnapshot(userId);

  return deleted ? withoutMongoId(deleted) : null;
}

export async function findUserById(userId: string) {
  return db.collections.users.findOne(
    {
      id: userId,
    },
    {
      projection: {
        _id: 0,
      },
    },
  );
}

export async function findUserByEmail(email: string) {
  return db.collections.users.findOne(
    {
      email,
    },
    {
      projection: {
        _id: 0,
      },
    },
  );
}

export async function createAdminAuditLog(input: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  const auditLog: AdminAuditLogRecord = {
    id: createDatabaseId(),
    actorId: input.actorId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    metadata: input.metadata ?? null,
    createdAt: new Date(),
  };

  await db.collections.adminAuditLogs.insertOne(auditLog);
  return auditLog;
}

export async function findRolesBySlugs(roleSlugs: readonly string[]) {
  return db.collections.roles.find(
    {
      slug: {
        $in: [...roleSlugs],
      },
    },
    {
      projection: {
        _id: 0,
        id: 1,
        slug: 1,
      },
    },
  ).toArray();
}

export async function createAdminUser(input: {
  fullName: string;
  email: string;
  passwordHash: string;
}) {
  const now = new Date();

  const user: UserRecord = {
    id: createDatabaseId(),
    name: input.fullName,
    email: input.email,
    passwordHash: input.passwordHash,
    emailVerified: now,
    phoneVerified: false,
    mustChangePassword: true,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await db.collections.users.insertOne(user);
  return user;
}
