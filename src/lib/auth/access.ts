import { getServerEnv } from "@/config/env/server-env";
import { db } from "@/lib/db/client";
import type {
  PermissionRecord,
  RolePermissionRecord,
  RoleRecord,
  UserRoleRecord,
} from "@/lib/db/types";
import { redisDelete, redisGetJson, redisSetJson } from "@/lib/redis/kv";
import { SYSTEM_ROLE } from "@/lib/auth/constants";

export interface AccessSnapshot {
  roles: string[];
  permissions: string[];
}

const ACCESS_CACHE_KEY_PREFIX = "user:access";

function buildAccessCacheKey(userId: string): string {
  return `${ACCESS_CACHE_KEY_PREFIX}:${userId}`;
}

export async function invalidateUserAccessSnapshot(userId: string): Promise<void> {
  await redisDelete(buildAccessCacheKey(userId));
}

export async function invalidateUsersAccessSnapshots(userIds: readonly string[]): Promise<void> {
  const uniqueUserIds = [...new Set(userIds)];
  await Promise.all(uniqueUserIds.map((userId) => invalidateUserAccessSnapshot(userId)));
}

export function isSuperAdmin(access: Pick<AccessSnapshot, "roles">): boolean {
  return access.roles.includes(SYSTEM_ROLE.SUPER_ADMIN);
}

export function hasPermission(
  access: Pick<AccessSnapshot, "roles" | "permissions">,
  permission: string,
): boolean {
  return isSuperAdmin(access) || access.permissions.includes(permission);
}

export async function getUserAccessSnapshot(userId: string): Promise<AccessSnapshot> {
  const env = getServerEnv(process.env);
  const cacheKey = buildAccessCacheKey(userId);

  const cachedSnapshot = await redisGetJson<AccessSnapshot>(cacheKey);
  if (cachedSnapshot) {
    return cachedSnapshot;
  }

  const userRoles = await db.collections.userRoles.find(
    { userId },
    {
      projection: {
        _id: 0,
      },
    },
  ).toArray() as UserRoleRecord[];

  if (userRoles.length === 0) {
    const emptySnapshot: AccessSnapshot = {
      roles: [],
      permissions: [],
    };

    await redisSetJson(
      cacheKey,
      emptySnapshot,
      env.REDIS_TTL_ACCESS_SNAPSHOT_SECONDS,
    );

    return emptySnapshot;
  }

  const roleIds = [...new Set(userRoles.map((userRole) => userRole.roleId))];

  const [roleRecords, rolePermissions] = await Promise.all([
    db.collections.roles.find(
      {
        id: {
          $in: roleIds,
        },
      },
      {
        projection: {
          _id: 0,
        },
      },
    ).toArray() as Promise<RoleRecord[]>,
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
  ]);

  const permissionIds = [
    ...new Set(rolePermissions.map((rolePermission) => rolePermission.permissionId)),
  ];

  const permissionRecords = permissionIds.length === 0
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

  const roleById = new Map(roleRecords.map((role) => [role.id, role]));
  const permissionById = new Map(permissionRecords.map((permission) => [permission.id, permission]));

  const roleSlugs = new Set<string>();
  const permissionKeys = new Set<string>();

  for (const userRole of userRoles) {
    const role = roleById.get(userRole.roleId);
    if (!role) {
      continue;
    }

    roleSlugs.add(role.slug);

    for (const rolePermission of rolePermissions) {
      if (rolePermission.roleId !== role.id) {
        continue;
      }

      const permission = permissionById.get(rolePermission.permissionId);
      if (!permission) {
        continue;
      }

      permissionKeys.add(permission.key);
    }
  }

  const snapshot: AccessSnapshot = {
    roles: [...roleSlugs],
    permissions: [...permissionKeys],
  };

  await redisSetJson(cacheKey, snapshot, env.REDIS_TTL_ACCESS_SNAPSHOT_SECONDS);

  return snapshot;
}
