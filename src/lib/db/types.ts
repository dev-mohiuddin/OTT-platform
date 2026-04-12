export type AuthCodePurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

export interface UserRecord {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  phone?: string | null;
  phoneVerified: boolean;
  passwordHash?: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountRecord {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export interface SessionRecord {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface VerificationTokenRecord {
  identifier: string;
  token: string;
  expires: Date;
}

export interface AuthCodeRecord {
  id: string;
  identifier: string;
  codeHash: string;
  purpose: AuthCodePurpose;
  expiresAt: Date;
  consumedAt?: Date | null;
  attemptCount: number;
  userId?: string | null;
  createdAt: Date;
}

export interface RoleRecord {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionRecord {
  id: string;
  key: string;
  label: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleRecord {
  userId: string;
  roleId: string;
  assignedById?: string | null;
  assignedAt: Date;
}

export interface RolePermissionRecord {
  roleId: string;
  permissionId: string;
  createdAt: Date;
}

export interface AdminAuditLogRecord {
  id: string;
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export interface AdminFeatureFlagRecord {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUploadDraftRecord {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  thumbnailUrl: string;
  sourceFileName: string;
  language: string;
  genre: string;
  qualityPreset: string;
  accessMode: "subscription" | "ticket" | "hybrid";
  minimumTier: "free" | "basic" | "standard" | "premium";
  ticketPrice?: number | null;
  ticketExpiresAt?: Date | null;
  isFeatured: boolean;
  isKidsSafe: boolean;
  allowPreview: boolean;
  status: "draft";
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
