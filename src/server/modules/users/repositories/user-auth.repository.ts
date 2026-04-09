import type { AuthCodePurpose, User } from "@prisma/client";

import { db } from "@/lib/db/client";

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

export async function findUserByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

export async function findUserByPhone(phone: string): Promise<User | null> {
  return db.user.findUnique({
    where: {
      phone,
    },
  });
}

export async function findUserByIdentifier(identifier: string): Promise<User | null> {
  if (identifier.includes("@")) {
    return findUserByEmail(identifier.toLowerCase());
  }

  return findUserByPhone(identifier);
}

export async function createUserWithPassword(
  input: CreateUserWithPasswordInput,
): Promise<User> {
  return db.user.create({
    data: {
      name: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash: input.passwordHash,
      emailVerified: input.emailVerified,
      phoneVerified: input.phoneVerified ?? false,
      isActive: true,
      mustChangePassword: false,
    },
  });
}

export async function assignRoleToUserBySlug(
  userId: string,
  roleSlug: string,
  assignedById?: string,
): Promise<void> {
  const role = await db.role.findUnique({
    where: {
      slug: roleSlug,
    },
    select: {
      id: true,
    },
  });

  if (!role) {
    return;
  }

  await db.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
    update: {
      assignedById: assignedById ?? undefined,
    },
    create: {
      userId,
      roleId: role.id,
      assignedById: assignedById ?? undefined,
    },
  });
}

export async function deleteAuthCodesForIdentifier(
  identifier: string,
  purpose: AuthCodePurpose,
): Promise<void> {
  await db.authCode.deleteMany({
    where: {
      identifier,
      purpose,
    },
  });
}

export async function createAuthCode(input: CreateAuthCodeInput) {
  return db.authCode.create({
    data: {
      identifier: input.identifier,
      purpose: input.purpose,
      codeHash: input.codeHash,
      expiresAt: input.expiresAt,
      userId: input.userId,
    },
  });
}

export async function getLatestAuthCode(identifier: string, purpose: AuthCodePurpose) {
  return db.authCode.findFirst({
    where: {
      identifier,
      purpose,
      consumedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function incrementAuthCodeAttempt(authCodeId: string): Promise<void> {
  await db.authCode.update({
    where: { id: authCodeId },
    data: {
      attemptCount: {
        increment: 1,
      },
    },
  });
}

export async function consumeAuthCode(authCodeId: string): Promise<void> {
  await db.authCode.update({
    where: { id: authCodeId },
    data: {
      consumedAt: new Date(),
    },
  });
}

export async function markUserEmailVerified(userId: string): Promise<void> {
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      emailVerified: new Date(),
    },
  });
}

export async function updateUserPassword(
  userId: string,
  passwordHash: string,
): Promise<void> {
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,
      mustChangePassword: false,
    },
  });
}
