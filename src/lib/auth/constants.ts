export const AUTH_CODE_LENGTH = 6;

export const SYSTEM_ROLE = {
  USER: "user",
  CO_ADMIN: "co-admin",
  SUPER_ADMIN: "super-admin",
} as const;

export const ADMIN_PERMISSION = {
  PANEL_ACCESS: "admin.panel.access",
  USERS_READ: "admin.users.read",
  USERS_CREATE: "admin.users.create",
  USERS_UPDATE: "admin.users.update",
  ROLES_READ: "admin.roles.read",
  ROLES_CREATE: "admin.roles.create",
  PERMISSIONS_READ: "admin.permissions.read",
  PERMISSIONS_CREATE: "admin.permissions.create",
  AUDIT_READ: "admin.audit.read",
} as const;

export const AUTH_CODE_PURPOSE = {
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  PASSWORD_RESET: "PASSWORD_RESET",
} as const;

export type AuthCodePurpose =
  (typeof AUTH_CODE_PURPOSE)[keyof typeof AUTH_CODE_PURPOSE];
