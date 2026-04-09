import { db } from "@/lib/db/client";
import { SYSTEM_ROLE } from "@/lib/auth/constants";

export interface AccessSnapshot {
  roles: string[];
  permissions: string[];
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
  const userRoles = await db.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const roles = new Set<string>();
  const permissions = new Set<string>();

  for (const userRole of userRoles) {
    roles.add(userRole.role.slug);

    for (const rolePermission of userRole.role.permissions) {
      permissions.add(rolePermission.permission.key);
    }
  }

  return {
    roles: [...roles],
    permissions: [...permissions],
  };
}
