import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters";

import { db } from "@/lib/db/client";
import { createDatabaseId } from "@/lib/db/id";
import type { AccountRecord, SessionRecord, UserRecord, VerificationTokenRecord } from "@/lib/db/types";
import { serverLogger } from "@/server/common/logging/server-logger";

function withoutMongoId<T extends { _id?: unknown }>(record: T): Omit<T, "_id"> {
  const rest = { ...record } as T & { _id?: unknown };
  delete rest._id;

  return rest;
}

function toAdapterUser(user: UserRecord | null): AdapterUser | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? "",
    emailVerified: user.emailVerified ?? null,
    image: user.image ?? null,
  };
}

function toAdapterAccount(account: AccountRecord): AdapterAccount {
  return {
    userId: account.userId,
    type: account.type as AdapterAccount["type"],
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    refresh_token: account.refresh_token ?? undefined,
    access_token: account.access_token ?? undefined,
    expires_at: account.expires_at ?? undefined,
    token_type: account.token_type
      ? (account.token_type.toLowerCase() as Lowercase<string>)
      : undefined,
    scope: account.scope ?? undefined,
    id_token: account.id_token ?? undefined,
    session_state: account.session_state ?? undefined,
  };
}

function toAdapterSession(session: SessionRecord): AdapterSession {
  return {
    sessionToken: session.sessionToken,
    userId: session.userId,
    expires: session.expires,
  };
}

function toVerificationToken(record: VerificationTokenRecord): VerificationToken {
  return {
    identifier: record.identifier,
    token: record.token,
    expires: record.expires,
  };
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function createMongoAuthAdapter(): Adapter {
  return {
    async createUser(user) {
      const now = new Date();

      const createdUser: UserRecord = {
        id: createDatabaseId(),
        name: user.name ?? null,
        email: user.email,
        emailVerified: user.emailVerified ?? null,
        image: user.image ?? null,
        phoneVerified: false,
        isActive: true,
        mustChangePassword: false,
        createdAt: now,
        updatedAt: now,
      };

      await db.collections.users.insertOne(createdUser);

      return {
        id: createdUser.id,
        name: createdUser.name ?? null,
        email: createdUser.email ?? "",
        emailVerified: createdUser.emailVerified ?? null,
        image: createdUser.image ?? null,
      };
    },

    async getUser(id) {
      const user = await db.collections.users.findOne(
        { id },
        { projection: { _id: 0 } },
      );

      return toAdapterUser(user);
    },

    async getUserByEmail(email) {
      const user = await db.collections.users.findOne(
        { email },
        { projection: { _id: 0 } },
      );

      return toAdapterUser(user);
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await db.collections.accounts.findOne(
        { provider, providerAccountId },
        { projection: { _id: 0, userId: 1 } },
      );

      if (!account) {
        return null;
      }

      const user = await db.collections.users.findOne(
        { id: account.userId },
        { projection: { _id: 0 } },
      );

      return toAdapterUser(user);
    },

    async updateUser(user) {
      const updatePayload: Partial<UserRecord> = {
        updatedAt: new Date(),
      };

      if (user.name !== undefined) {
        updatePayload.name = user.name;
      }

      if (user.email !== undefined) {
        updatePayload.email = user.email;
      }

      if (user.image !== undefined) {
        updatePayload.image = user.image;
      }

      if (user.emailVerified !== undefined) {
        updatePayload.emailVerified = user.emailVerified;
      }

      await db.collections.users.updateOne(
        { id: user.id },
        {
          $set: updatePayload,
        },
      );

      const updatedUser = await db.collections.users.findOne(
        { id: user.id },
        { projection: { _id: 0 } },
      );

      const adapterUser = toAdapterUser(updatedUser);
      if (!adapterUser) {
        throw new Error("Unable to update user in Mongo adapter.");
      }

      return adapterUser;
    },

    async deleteUser(userId) {
      const deletedUser = await db.collections.users.findOneAndDelete(
        { id: userId },
        { projection: { _id: 0 } },
      );

      await Promise.all([
        db.collections.accounts.deleteMany({ userId }),
        db.collections.sessions.deleteMany({ userId }),
        db.collections.authCodes.deleteMany({ userId }),
        db.collections.userRoles.deleteMany({ userId }),
        db.collections.adminAuditLogs.updateMany(
          { actorId: userId },
          {
            $set: {
              actorId: null,
            },
          },
        ),
      ]);

      return toAdapterUser(deletedUser ? withoutMongoId(deletedUser) : null);
    },

    async linkAccount(account) {
      const userId = toNonEmptyString(account.userId);
      const provider = toNonEmptyString(account.provider);
      const providerAccountId = toNonEmptyString(account.providerAccountId);

      if (!userId || !provider || !providerAccountId) {
        throw new Error("Cannot link account without userId, provider, and providerAccountId.");
      }

      if (provider === "google" && !toOptionalString(account.access_token)) {
        serverLogger.warn("Google account linked without access token.", {
          userId,
          provider,
        });
      }

      const accountId = createDatabaseId();
      const tokenType = toOptionalString(account.token_type);

      await db.collections.accounts.updateOne(
        {
          provider,
          providerAccountId,
        },
        {
          $set: {
            userId,
            type: account.type,
            provider,
            providerAccountId,
            refresh_token: toOptionalString(account.refresh_token),
            access_token: toOptionalString(account.access_token),
            expires_at: toOptionalNumber(account.expires_at),
            token_type: tokenType ? tokenType.toLowerCase() : undefined,
            scope: toOptionalString(account.scope),
            id_token: toOptionalString(account.id_token),
            session_state: toOptionalString(account.session_state),
          },
          $setOnInsert: {
            id: accountId,
          },
        },
        {
          upsert: true,
        },
      );

      return undefined;
    },

    async unlinkAccount({ provider, providerAccountId }) {
      const deletedAccount = await db.collections.accounts.findOneAndDelete(
        { provider, providerAccountId },
        { projection: { _id: 0 } },
      );

      return deletedAccount ? toAdapterAccount(withoutMongoId(deletedAccount)) : undefined;
    },

    async getAccount(providerAccountId, provider) {
      const account = await db.collections.accounts.findOne(
        { provider, providerAccountId },
        { projection: { _id: 0 } },
      );

      return account ? toAdapterAccount(account) : null;
    },

    async createSession(session) {
      const sessionRecord: SessionRecord = {
        id: createDatabaseId(),
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      };

      await db.collections.sessions.insertOne(sessionRecord);

      return toAdapterSession(sessionRecord);
    },

    async getSessionAndUser(sessionToken) {
      const session = await db.collections.sessions.findOne(
        { sessionToken },
        { projection: { _id: 0 } },
      );

      if (!session) {
        return null;
      }

      const user = await db.collections.users.findOne(
        { id: session.userId },
        { projection: { _id: 0 } },
      );

      const adapterUser = toAdapterUser(user);
      if (!adapterUser) {
        return null;
      }

      return {
        session: toAdapterSession(session),
        user: adapterUser,
      };
    },

    async updateSession(session) {
      await db.collections.sessions.updateOne(
        { sessionToken: session.sessionToken },
        {
          $set: {
            ...(session.userId !== undefined ? { userId: session.userId } : {}),
            ...(session.expires !== undefined ? { expires: session.expires } : {}),
          },
        },
      );

      const updated = await db.collections.sessions.findOne(
        { sessionToken: session.sessionToken },
        { projection: { _id: 0 } },
      );

      return updated ? toAdapterSession(updated) : null;
    },

    async deleteSession(sessionToken) {
      const deletedSession = await db.collections.sessions.findOneAndDelete(
        { sessionToken },
        { projection: { _id: 0 } },
      );

      return deletedSession ? toAdapterSession(withoutMongoId(deletedSession)) : null;
    },

    async createVerificationToken(verificationToken) {
      const tokenRecord: VerificationTokenRecord = {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      };

      await db.collections.verificationTokens.insertOne(tokenRecord);

      return toVerificationToken(tokenRecord);
    },

    async useVerificationToken({ identifier, token }) {
      const verificationToken = await db.collections.verificationTokens.findOneAndDelete(
        {
          identifier,
          token,
        },
        {
          projection: {
            _id: 0,
          },
        },
      );

      return verificationToken ? toVerificationToken(withoutMongoId(verificationToken)) : null;
    },
  };
}
