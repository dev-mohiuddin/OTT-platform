import {
  MongoClient,
  type Collection,
  type Db,
} from "mongodb";

import { getServerEnv } from "@/config/env/server-env";
import { serverLogger } from "@/server/common/logging/server-logger";
import type {
  AccountRecord,
  AdminAuditLogRecord,
  AuthCodeRecord,
  PermissionRecord,
  RolePermissionRecord,
  RoleRecord,
  SessionRecord,
  UserRecord,
  UserRoleRecord,
  VerificationTokenRecord,
} from "@/lib/db/types";

export interface DatabaseCollections {
  users: Collection<UserRecord>;
  accounts: Collection<AccountRecord>;
  sessions: Collection<SessionRecord>;
  verificationTokens: Collection<VerificationTokenRecord>;
  authCodes: Collection<AuthCodeRecord>;
  roles: Collection<RoleRecord>;
  permissions: Collection<PermissionRecord>;
  userRoles: Collection<UserRoleRecord>;
  rolePermissions: Collection<RolePermissionRecord>;
  adminAuditLogs: Collection<AdminAuditLogRecord>;
}

export interface DatabaseClient {
  client: MongoClient;
  database: Db;
  collections: DatabaseCollections;
}

const DEFAULT_DB_NAME = "ott_platform";

const globalForDatabase = globalThis as unknown as {
  database?: DatabaseClient;
  indexesReady?: boolean;
};

function createUnavailableDatabaseProxy(message: string): DatabaseClient {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(message);
      },
    },
  ) as DatabaseClient;
}

function isMongoConnectionString(value: string): boolean {
  return value.startsWith("mongodb://") || value.startsWith("mongodb+srv://");
}

function resolveDatabaseName(mongoUri: string, preferred?: string): string {
  if (preferred && preferred.trim().length > 0) {
    return preferred.trim();
  }

  try {
    const parsed = new URL(mongoUri);
    const path = parsed.pathname.replace(/^\/+/, "").trim();

    return path.length > 0 ? path : DEFAULT_DB_NAME;
  } catch {
    return DEFAULT_DB_NAME;
  }
}

async function ensureOptionalUniqueStringIndex(
  collection: Collection<UserRecord>,
  field: "email" | "phone",
): Promise<void> {
  const indexName = `${field}_1`;
  const indexes = await collection.indexes();
  const existing = indexes.find((index) => index.name === indexName);

  const partialFilterExpression = existing?.partialFilterExpression as
    | Record<string, { $type?: string }>
    | undefined;

  const hasStringPartialFilter = partialFilterExpression?.[field]?.$type === "string";

  if (existing && (!existing.unique || !hasStringPartialFilter)) {
    await collection.dropIndex(indexName);
  }

  if (!existing || !existing.unique || !hasStringPartialFilter) {
    await collection.createIndex(
      { [field]: 1 },
      {
        unique: true,
        partialFilterExpression: {
          [field]: {
            $type: "string",
          },
        },
      },
    );
  }
}

async function ensureIndexes(collections: DatabaseCollections): Promise<void> {
  if (globalForDatabase.indexesReady) {
    return;
  }

  await ensureOptionalUniqueStringIndex(collections.users, "email");
  await ensureOptionalUniqueStringIndex(collections.users, "phone");

  await Promise.all([
    collections.users.createIndex({ id: 1 }, { unique: true }),
    collections.accounts.createIndex({ id: 1 }, { unique: true }),
    collections.accounts.createIndex(
      { provider: 1, providerAccountId: 1 },
      { unique: true },
    ),
    collections.accounts.createIndex({ userId: 1 }),
    collections.sessions.createIndex({ id: 1 }, { unique: true }),
    collections.sessions.createIndex({ sessionToken: 1 }, { unique: true }),
    collections.sessions.createIndex({ userId: 1 }),
    collections.sessions.createIndex({ expires: 1 }, { expireAfterSeconds: 0 }),
    collections.verificationTokens.createIndex({ token: 1 }, { unique: true }),
    collections.verificationTokens.createIndex(
      { identifier: 1, token: 1 },
      { unique: true },
    ),
    collections.verificationTokens.createIndex(
      { expires: 1 },
      { expireAfterSeconds: 0 },
    ),
    collections.authCodes.createIndex({ id: 1 }, { unique: true }),
    collections.authCodes.createIndex({ identifier: 1, purpose: 1 }),
    collections.authCodes.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    collections.roles.createIndex({ id: 1 }, { unique: true }),
    collections.roles.createIndex({ slug: 1 }, { unique: true }),
    collections.permissions.createIndex({ id: 1 }, { unique: true }),
    collections.permissions.createIndex({ key: 1 }, { unique: true }),
    collections.userRoles.createIndex({ userId: 1, roleId: 1 }, { unique: true }),
    collections.userRoles.createIndex({ roleId: 1 }),
    collections.rolePermissions.createIndex(
      { roleId: 1, permissionId: 1 },
      { unique: true },
    ),
    collections.rolePermissions.createIndex({ permissionId: 1 }),
    collections.adminAuditLogs.createIndex({ id: 1 }, { unique: true }),
    collections.adminAuditLogs.createIndex({ actorId: 1 }),
    collections.adminAuditLogs.createIndex({ targetType: 1, targetId: 1 }),
    collections.adminAuditLogs.createIndex({ createdAt: 1 }),
  ]);

  globalForDatabase.indexesReady = true;
}

async function bootstrapDatabase(dbClient: DatabaseClient): Promise<void> {
  try {
    await dbClient.client.connect();
    await ensureIndexes(dbClient.collections);
  } catch (error) {
    serverLogger.error("MongoDB bootstrap failed", {
      error,
    });
  }
}

function createDatabaseClient(): DatabaseClient {
  const env = getServerEnv(process.env);

  if (!env.MONGODB_URI) {
    return createUnavailableDatabaseProxy("MONGODB_URI is required to use MongoDB client.");
  }

  if (!isMongoConnectionString(env.MONGODB_URI)) {
    serverLogger.warn("MongoDB client not initialized due to invalid MONGODB_URI scheme", {
      mongoUriPrefix: env.MONGODB_URI.split("://", 1)[0] ?? "unknown",
    });

    return createUnavailableDatabaseProxy(
      "Invalid MONGODB_URI. It must start with mongodb:// or mongodb+srv://.",
    );
  }

  try {
    const mongoClient = new MongoClient(env.MONGODB_URI);
    const database = mongoClient.db(
      resolveDatabaseName(env.MONGODB_URI, env.MONGODB_DB_NAME),
    );

    const dbClient: DatabaseClient = {
      client: mongoClient,
      database,
      collections: {
        users: database.collection<UserRecord>("users"),
        accounts: database.collection<AccountRecord>("accounts"),
        sessions: database.collection<SessionRecord>("sessions"),
        verificationTokens: database.collection<VerificationTokenRecord>("verification_tokens"),
        authCodes: database.collection<AuthCodeRecord>("auth_codes"),
        roles: database.collection<RoleRecord>("roles"),
        permissions: database.collection<PermissionRecord>("permissions"),
        userRoles: database.collection<UserRoleRecord>("user_roles"),
        rolePermissions: database.collection<RolePermissionRecord>("role_permissions"),
        adminAuditLogs: database.collection<AdminAuditLogRecord>("admin_audit_logs"),
      },
    };

    void bootstrapDatabase(dbClient);

    return dbClient;
  } catch (error) {
    serverLogger.error("MongoDB client initialization failed", {
      error,
    });

    return createUnavailableDatabaseProxy(
      "Unable to initialize MongoDB client. Check MONGODB_URI configuration.",
    );
  }
}

export const db = globalForDatabase.database ?? createDatabaseClient();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.database = db;
}
