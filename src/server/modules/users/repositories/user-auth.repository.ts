import type { WithId } from "mongodb";

import { getServerEnv } from "@/config/env/server-env";
import type { AuthCodePurpose } from "@/lib/auth/constants";
import { invalidateUserAccessSnapshot } from "@/lib/auth/access";
import { db } from "@/lib/db/client";
import { createDatabaseId } from "@/lib/db/id";
import type { AuthCodeRecord, RoleRecord, UserRecord } from "@/lib/db/types";
import { redisDelete, redisGet, redisIncrementWithExpiry } from "@/lib/redis/kv";

interface CreateUserWithPasswordInput {
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  emailVerified?: Date;
  phoneVerified?: boolean;
}

interface CreateAuthCodeInput {
  identifier: string;
  purpose: AuthCodePurpose;
  codeHash: string;
  expiresAt: Date;
  userId?: string;
}

function withoutMongoId<T extends { _id?: unknown }>(record: T): Omit<T, "_id"> {
  const rest = { ...record } as T & { _id?: unknown };
  delete rest._id;

  return rest;
}

function toUserRecord(record: WithId<UserRecord> | null): UserRecord | null {
  if (!record) {
    return null;
  }

  return withoutMongoId(record) as UserRecord;
}

function toAuthCodeRecord(record: WithId<AuthCodeRecord> | null): AuthCodeRecord | null {
  if (!record) {
    return null;
  }

  return withoutMongoId(record) as AuthCodeRecord;
}

function buildAuthAttemptKey(authCodeId: string): string {
  return `auth:code:attempts:${authCodeId}`;
}

async function readAuthAttemptCount(authCodeId: string): Promise<number | null> {
  const rawValue = await redisGet(buildAuthAttemptKey(authCodeId));
  if (!rawValue) {
    return null;
  }

  const value = Number.parseInt(rawValue, 10);
  return Number.isFinite(value) ? value : null;
}

function resolveAuthAttemptTtlSeconds(expiresAt?: Date): number {
  const env = getServerEnv(process.env);

  if (!expiresAt) {
    return env.REDIS_TTL_AUTH_ATTEMPT_SECONDS;
  }

  const remainingMs = expiresAt.getTime() - Date.now();
  if (remainingMs <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(remainingMs / 1_000));
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const user = await db.collections.users.findOne({ email });
  return toUserRecord(user);
}

export async function findUserByPhone(phone: string): Promise<UserRecord | null> {
  const user = await db.collections.users.findOne({ phone });
  return toUserRecord(user);
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const user = await db.collections.users.findOne({ id });
  return toUserRecord(user);
}

export async function findUserByIdentifier(identifier: string): Promise<UserRecord | null> {
  if (identifier.includes("@")) {
    return findUserByEmail(identifier.toLowerCase());
  }

  return findUserByPhone(identifier);
}

export async function createUserWithPassword(
  input: CreateUserWithPasswordInput,
): Promise<UserRecord> {
  const now = new Date();

  const user: UserRecord = {
    id: createDatabaseId(),
    name: input.fullName,
    ...(input.email ? { email: input.email } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
    passwordHash: input.passwordHash,
    emailVerified: input.emailVerified ?? null,
    phoneVerified: input.phoneVerified ?? false,
    isActive: true,
    mustChangePassword: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.collections.users.insertOne(user);
  return user;
}

async function findRoleBySlug(roleSlug: string): Promise<RoleRecord | null> {
  const role = await db.collections.roles.findOne(
    {
      slug: roleSlug,
    },
    {
      projection: {
        _id: 0,
      },
    },
  );

  return role;
}

export async function assignRoleToUserBySlug(
  userId: string,
  roleSlug: string,
  assignedById?: string,
): Promise<void> {
  const role = await findRoleBySlug(roleSlug);

  if (!role) {
    return;
  }

  await db.collections.userRoles.updateOne({
    userId,
    roleId: role.id,
  }, {
    $set: {
      assignedById: assignedById ?? null,
      assignedAt: new Date(),
    },
    $setOnInsert: {
      userId,
      roleId: role.id,
    },
  }, {
    upsert: true,
  });

  await invalidateUserAccessSnapshot(userId);
}

export async function deleteAuthCodesForIdentifier(
  identifier: string,
  purpose: AuthCodePurpose,
): Promise<void> {
  await db.collections.authCodes.deleteMany({ identifier, purpose });
}

export async function createAuthCode(input: CreateAuthCodeInput) {
  const authCode: AuthCodeRecord = {
    id: createDatabaseId(),
    identifier: input.identifier,
    purpose: input.purpose,
    codeHash: input.codeHash,
    expiresAt: input.expiresAt,
    userId: input.userId,
    attemptCount: 0,
    consumedAt: null,
    createdAt: new Date(),
  };

  await db.collections.authCodes.insertOne(authCode);
  return authCode;
}

export async function getLatestAuthCode(identifier: string, purpose: AuthCodePurpose) {
  const authCode = await db.collections.authCodes.findOne({
    identifier,
    purpose,
    consumedAt: null,
  }, {
    sort: {
      createdAt: -1,
    },
  });

  const normalizedCode = toAuthCodeRecord(authCode);
  if (!normalizedCode) {
    return null;
  }

  const throttledCount = await readAuthAttemptCount(normalizedCode.id);
  if (throttledCount !== null && throttledCount > normalizedCode.attemptCount) {
    return {
      ...normalizedCode,
      attemptCount: throttledCount,
    };
  }

  return normalizedCode;
}

export async function incrementAuthCodeAttempt(authCodeId: string): Promise<void> {
  await db.collections.authCodes.updateOne({ id: authCodeId }, {
    $inc: {
      attemptCount: 1,
    },
  });

  const authCode = await db.collections.authCodes.findOne(
    { id: authCodeId },
    { projection: { expiresAt: 1 } },
  );

  const counter = await redisIncrementWithExpiry(
    buildAuthAttemptKey(authCodeId),
    resolveAuthAttemptTtlSeconds(authCode?.expiresAt),
  );

  if (counter !== null) {
    await db.collections.authCodes.updateOne(
      { id: authCodeId },
      {
        $max: {
          attemptCount: counter,
        },
      },
    );
  }
}

export async function consumeAuthCode(authCodeId: string): Promise<void> {
  await db.collections.authCodes.updateOne(
    { id: authCodeId },
    {
      $set: {
        consumedAt: new Date(),
      },
    },
  );

  await redisDelete(buildAuthAttemptKey(authCodeId));
}

export async function markUserEmailVerified(userId: string): Promise<void> {
  await db.collections.users.updateOne(
    {
      id: userId,
    },
    {
      $set: {
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
    },
  );
}

export async function updateUserPassword(
  userId: string,
  passwordHash: string,
): Promise<void> {
  await db.collections.users.updateOne(
    {
      id: userId,
    },
    {
      $set: {
        passwordHash,
        mustChangePassword: false,
        updatedAt: new Date(),
      },
    },
  );
}
