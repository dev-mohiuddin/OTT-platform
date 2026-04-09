import { AppError } from "@/server/common/errors/app-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";
import { normalizeIdentifier } from "@/lib/auth/code";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { db } from "@/lib/db/client";
import {
  assignUserRoleSchema,
  createAdminUserSchema,
  createPermissionSchema,
  createRoleSchema,
} from "@/server/modules/admin/validators/rbac.schemas";
import {
  assignRoleToUser,
  createAdminAuditLog,
  createPermission,
  createRole,
  findPermissionsByKeys,
  findUserByEmail,
  findUserById,
  getRoleBySlug,
  listPermissions,
  listRolesWithPermissions,
  listUsersWithRoles,
  removeRoleFromUser,
  replaceRolePermissions,
} from "@/server/modules/admin/repositories/rbac.repository";

export async function listPermissionsUseCase() {
  return listPermissions();
}

export async function createPermissionUseCase(rawInput: {
  key: string;
  label: string;
  description?: string;
}) {
  const input = createPermissionSchema.parse(rawInput);

  try {
    return await createPermission({
      key: input.key,
      label: input.label,
      description: input.description,
    });
  } catch {
    throw new AppError("Permission key already exists.", {
      code: API_ERROR_CODES.CONFLICT,
      expose: true,
    });
  }
}

export async function listRolesUseCase() {
  return listRolesWithPermissions();
}

export async function createRoleUseCase(
  rawInput: {
    name: string;
    slug: string;
    description?: string;
    permissionKeys?: string[];
  },
  actorId: string,
) {
  const input = createRoleSchema.parse(rawInput);

  const existingRole = await getRoleBySlug(input.slug);
  if (existingRole) {
    throw new AppError("Role slug already exists.", {
      code: API_ERROR_CODES.CONFLICT,
      expose: true,
    });
  }

  const permissions = await findPermissionsByKeys(input.permissionKeys);
  if (permissions.length !== input.permissionKeys.length) {
    const existingKeys = new Set(permissions.map((permission) => permission.key));
    const missingKeys = input.permissionKeys.filter((key) => !existingKeys.has(key));

    throw new AppError("Some permissions do not exist.", {
      code: API_ERROR_CODES.PERMISSION_NOT_FOUND,
      expose: true,
      details: {
        missingKeys,
      },
    });
  }

  const role = await createRole({
    name: input.name,
    slug: input.slug,
    description: input.description,
  });

  await replaceRolePermissions(
    role.id,
    permissions.map((permission) => permission.id),
  );

  await createAdminAuditLog({
    actorId,
    action: "admin.role.create",
    targetType: "role",
    targetId: role.id,
    metadata: {
      slug: role.slug,
      permissionCount: permissions.length,
    },
  });

  return role;
}

export async function listAdminUsersUseCase() {
  return listUsersWithRoles();
}

export async function createAdminUserUseCase(
  rawInput: {
    fullName: string;
    email: string;
    password: string;
    roleSlugs: string[];
  },
  actorId: string,
) {
  const input = createAdminUserSchema.parse(rawInput);
  const normalizedEmail = normalizeIdentifier(input.email);

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError("User already exists with this email.", {
      code: API_ERROR_CODES.CONFLICT,
      expose: true,
    });
  }

  const passwordValidation = validatePasswordStrength(input.password);
  if (!passwordValidation.isValid) {
    throw new AppError("Password does not meet security requirements.", {
      code: API_ERROR_CODES.VALIDATION_ERROR,
      expose: true,
      details: {
        password: passwordValidation.errors,
      },
    });
  }

  const roles = await db.role.findMany({
    where: {
      slug: {
        in: input.roleSlugs,
      },
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (roles.length !== input.roleSlugs.length) {
    const existingRoleSlugs = new Set(roles.map((role) => role.slug));
    const missingRoleSlugs = input.roleSlugs.filter((slug) => !existingRoleSlugs.has(slug));

    throw new AppError("Some selected roles do not exist.", {
      code: API_ERROR_CODES.ROLE_NOT_FOUND,
      expose: true,
      details: {
        missingRoleSlugs,
      },
    });
  }

  const passwordHash = await hashPassword(input.password);

  const adminUser = await db.user.create({
    data: {
      name: input.fullName,
      email: normalizedEmail,
      passwordHash,
      emailVerified: new Date(),
      mustChangePassword: true,
      isActive: true,
    },
  });

  await Promise.all(
    roles.map((role) =>
      assignRoleToUser(adminUser.id, role.id, actorId),
    ),
  );

  await createAdminAuditLog({
    actorId,
    action: "admin.user.create",
    targetType: "user",
    targetId: adminUser.id,
    metadata: {
      email: adminUser.email,
      roleSlugs: input.roleSlugs,
    },
  });

  return {
    id: adminUser.id,
    email: adminUser.email,
    roleSlugs: input.roleSlugs,
    mustChangePassword: adminUser.mustChangePassword,
  };
}

export async function assignRoleToUserUseCase(
  userId: string,
  rawInput: { roleSlug: string },
  actorId: string,
) {
  const input = assignUserRoleSchema.parse(rawInput);

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found.", {
      code: API_ERROR_CODES.NOT_FOUND,
      expose: true,
    });
  }

  const role = await getRoleBySlug(input.roleSlug);
  if (!role) {
    throw new AppError("Role not found.", {
      code: API_ERROR_CODES.ROLE_NOT_FOUND,
      expose: true,
    });
  }

  await assignRoleToUser(user.id, role.id, actorId);

  await createAdminAuditLog({
    actorId,
    action: "admin.user.role.assign",
    targetType: "user",
    targetId: user.id,
    metadata: {
      roleSlug: role.slug,
    },
  });

  return {
    message: "Role assigned successfully.",
  };
}

export async function removeRoleFromUserUseCase(
  userId: string,
  rawInput: { roleSlug: string },
  actorId: string,
) {
  const input = assignUserRoleSchema.parse(rawInput);

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found.", {
      code: API_ERROR_CODES.NOT_FOUND,
      expose: true,
    });
  }

  const role = await getRoleBySlug(input.roleSlug);
  if (!role) {
    throw new AppError("Role not found.", {
      code: API_ERROR_CODES.ROLE_NOT_FOUND,
      expose: true,
    });
  }

  await removeRoleFromUser(user.id, role.id);

  await createAdminAuditLog({
    actorId,
    action: "admin.user.role.remove",
    targetType: "user",
    targetId: user.id,
    metadata: {
      roleSlug: role.slug,
    },
  });

  return {
    message: "Role removed successfully.",
  };
}
