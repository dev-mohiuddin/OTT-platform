import { db } from "@/lib/db/client";
import { createDatabaseId } from "@/lib/db/id";
import type {
  AdminFeatureFlagRecord,
  AdminUploadDraftRecord,
  UserRecord,
} from "@/lib/db/types";
import type {
  AdminAuditLogEvent,
  AdminFeatureFlag,
  AdminUploadDraft,
  CreateAdminUploadDraftInput,
} from "@/server/modules/admin/types/console.types";

const defaultFeatureFlags: Array<
  Pick<AdminFeatureFlagRecord, "id" | "label" | "description" | "enabled">
> = [
  {
    id: "ff-upload-validation",
    label: "Strict upload validation",
    description: "Block publishing if metadata or policy fields are incomplete.",
    enabled: true,
  },
  {
    id: "ff-hybrid-entitlement",
    label: "Hybrid entitlement mode",
    description: "Allow playback through subscription OR ticket for eligible titles.",
    enabled: true,
  },
  {
    id: "ff-ticket-expiry-hard-stop",
    label: "Hard stop on ticket expiry",
    description: "Immediately revoke access when fixed ticket expiry is reached.",
    enabled: true,
  },
  {
    id: "ff-admin-operation-alerts",
    label: "Admin operation alerts",
    description: "Emit alerts for failed publishes and policy mismatches.",
    enabled: false,
  },
];

function getAdminFeatureFlagsCollection() {
  return db.collections.adminFeatureFlags
    ?? db.database.collection<AdminFeatureFlagRecord>("admin_feature_flags");
}

function getAdminUploadDraftsCollection() {
  return db.collections.adminUploadDrafts
    ?? db.database.collection<AdminUploadDraftRecord>("admin_upload_drafts");
}

function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function mapFeatureFlagRecord(record: AdminFeatureFlagRecord): AdminFeatureFlag {
  return {
    id: record.id,
    label: record.label,
    description: record.description,
    enabled: record.enabled,
  };
}

function mapUploadDraftRecord(record: AdminUploadDraftRecord): AdminUploadDraft {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    accessMode: record.accessMode,
    minimumTier: record.minimumTier,
    status: record.status,
    createdAt: formatTimestamp(record.createdAt),
  };
}

async function ensureDefaultFeatureFlags(): Promise<void> {
  const adminFeatureFlags = getAdminFeatureFlagsCollection();
  const now = new Date();

  await Promise.all(
    defaultFeatureFlags.map((flag) =>
      adminFeatureFlags.updateOne(
        { id: flag.id },
        {
          $setOnInsert: {
            ...flag,
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true },
      ),
    ),
  );
}

export async function listAdminFeatureFlagsRepository(): Promise<AdminFeatureFlag[]> {
  await ensureDefaultFeatureFlags();

  const adminFeatureFlags = getAdminFeatureFlagsCollection();

  const records = await adminFeatureFlags.find(
    {},
    {
      projection: {
        _id: 0,
      },
    },
  ).sort({ id: 1 }).toArray();

  return records.map(mapFeatureFlagRecord);
}

export async function saveAdminFeatureFlagsRepository(input: Array<{ id: string; enabled: boolean }>): Promise<{
  flags: AdminFeatureFlag[];
  missingFlagIds: string[];
}> {
  await ensureDefaultFeatureFlags();
  const adminFeatureFlags = getAdminFeatureFlagsCollection();

  const ids = [...new Set(input.map((flag) => flag.id))];

  const existing = await adminFeatureFlags.find(
    {
      id: {
        $in: ids,
      },
    },
    {
      projection: {
        _id: 0,
        id: 1,
      },
    },
  ).toArray();

  const existingIds = new Set(existing.map((flag) => flag.id));
  const missingFlagIds = ids.filter((id) => !existingIds.has(id));

  if (missingFlagIds.length > 0) {
    return {
      flags: await listAdminFeatureFlagsRepository(),
      missingFlagIds,
    };
  }

  const now = new Date();

  await adminFeatureFlags.bulkWrite(
    input.map((flag) => ({
      updateOne: {
        filter: {
          id: flag.id,
        },
        update: {
          $set: {
            enabled: flag.enabled,
            updatedAt: now,
          },
        },
      },
    })),
    { ordered: false },
  );

  return {
    flags: await listAdminFeatureFlagsRepository(),
    missingFlagIds: [],
  };
}

export async function listAdminAuditLogEventsRepository(limit: number = 200): Promise<AdminAuditLogEvent[]> {
  const logs = await db.collections.adminAuditLogs.find(
    {},
    {
      projection: {
        _id: 0,
      },
    },
  ).sort({ createdAt: -1 }).limit(limit).toArray();

  const actorIds = [...new Set(logs.map((log) => log.actorId).filter((actorId): actorId is string => Boolean(actorId)))];

  const actors = actorIds.length === 0
    ? []
    : await db.collections.users.find(
      {
        id: {
          $in: actorIds,
        },
      },
      {
        projection: {
          _id: 0,
          id: 1,
          name: 1,
          email: 1,
        },
      },
    ).toArray() as Array<Pick<UserRecord, "id" | "name" | "email">>;

  const actorMap = new Map(actors.map((actor) => [actor.id, actor]));

  return logs.map((log) => {
    const actor = log.actorId ? actorMap.get(log.actorId) : null;

    return {
      id: log.id,
      actor: actor?.email ?? actor?.name ?? "system@dristy.com",
      action: log.action,
      target: log.targetId ?? log.targetType,
      at: formatTimestamp(log.createdAt),
    };
  });
}

export async function createAdminUploadDraftRepository(
  input: CreateAdminUploadDraftInput,
  actorId: string,
): Promise<AdminUploadDraft> {
  const adminUploadDrafts = getAdminUploadDraftsCollection();
  const now = new Date();

  const ticketExpiresAt = input.ticketExpiresAt ? new Date(input.ticketExpiresAt) : null;
  const normalizedTicketExpiresAt = ticketExpiresAt && !Number.isNaN(ticketExpiresAt.getTime())
    ? ticketExpiresAt
    : null;

  const record: AdminUploadDraftRecord = {
    id: createDatabaseId(),
    title: input.title,
    slug: input.slug,
    synopsis: input.synopsis,
    thumbnailUrl: input.thumbnailUrl,
    sourceFileName: input.sourceFileName,
    language: input.language,
    genre: input.genre,
    qualityPreset: input.qualityPreset,
    accessMode: input.accessMode,
    minimumTier: input.minimumTier,
    ticketPrice: input.ticketPrice ?? null,
    ticketExpiresAt: normalizedTicketExpiresAt,
    isFeatured: input.isFeatured ?? true,
    isKidsSafe: input.isKidsSafe ?? false,
    allowPreview: input.allowPreview ?? true,
    status: "draft",
    createdById: actorId,
    createdAt: now,
    updatedAt: now,
  };

  await adminUploadDrafts.insertOne(record);

  return mapUploadDraftRecord(record);
}
