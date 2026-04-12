import type {
  AdminAuditLogEvent,
  AdminContentCatalog,
  AdminContentItem,
  AdminDashboardSummary,
  AdminFeatureFlag,
  AdminSubscriptionOverview,
  AdminTicketOffer,
  AdminTicketSalesOverview,
  AdminUploadDraft,
  AdminUploadBlueprint,
} from "@/server/modules/admin/types/console.types";
import { AppError } from "@/server/common/errors/app-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";
import {
  createAdminUploadDraftRepository,
  listAdminAuditLogEventsRepository,
  listAdminFeatureFlagsRepository,
  saveAdminFeatureFlagsRepository,
} from "@/server/modules/admin/repositories/console.repository";
import { createAdminAuditLog } from "@/server/modules/admin/repositories/rbac.repository";
import {
  createAdminContentDraftSchema,
  createAdminTicketOfferSchema,
  createAdminUploadDraftSchema,
  saveAdminFeatureFlagsSchema,
  updateAdminContentDraftSchema,
} from "@/server/modules/admin/validators/console.schemas";

const contentCatalog: AdminContentCatalog = {
  summary: {
    total: 5,
    drafts: 1,
    scheduled: 2,
    hybrid: 2,
  },
  items: [
    {
      id: "CNT-2026-001",
      title: "Shadow City: Final Cut",
      format: "Movie",
      status: "draft",
      accessMode: "hybrid",
      quality: "4K + 1080p",
      publishAt: "Unscheduled",
      owner: "Content Ops",
    },
    {
      id: "CNT-2026-002",
      title: "River of Silence",
      format: "Movie",
      status: "scheduled",
      accessMode: "subscription",
      quality: "1080p",
      publishAt: "2026-04-20 20:00",
      owner: "Editorial Team",
    },
    {
      id: "CNT-2026-003",
      title: "Weekend Stadium",
      format: "Series",
      status: "published",
      accessMode: "ticket",
      quality: "1080p + 720p",
      publishAt: "2026-04-08 18:00",
      owner: "Sports Desk",
    },
    {
      id: "CNT-2026-004",
      title: "City After Rain",
      format: "Series",
      status: "archived",
      accessMode: "subscription",
      quality: "720p",
      publishAt: "2026-03-01 10:00",
      owner: "Library Team",
    },
    {
      id: "CNT-2026-005",
      title: "Codebreak Chronicles",
      format: "Series",
      status: "scheduled",
      accessMode: "hybrid",
      quality: "4K + 1080p",
      publishAt: "2026-04-25 22:00",
      owner: "Originals Team",
    },
  ],
};

const subscriptionsOverview: AdminSubscriptionOverview = {
  plans: [
    {
      slug: "free",
      price: "0",
      activeSubscribers: 1082,
      entitlement: "Limited catalog",
    },
    {
      slug: "basic",
      price: "299",
      activeSubscribers: 826,
      entitlement: "Standard catalog",
    },
    {
      slug: "standard",
      price: "499",
      activeSubscribers: 645,
      entitlement: "HD catalog + selected premieres",
    },
    {
      slug: "premium",
      price: "799",
      activeSubscribers: 291,
      entitlement: "4K catalog + early access",
    },
  ],
  lifecycle: [
    {
      event: "Renewed",
      count: 142,
      window: "Last 24h",
    },
    {
      event: "Upgraded",
      count: 37,
      window: "Last 24h",
    },
    {
      event: "Downgraded",
      count: 18,
      window: "Last 24h",
    },
    {
      event: "Cancelled",
      count: 11,
      window: "Last 24h",
    },
  ],
};

const ticketSalesOverview: AdminTicketSalesOverview = {
  offers: [
    {
      id: "TK-1401",
      title: "Weekend Stadium Live",
      price: 59,
      expiresAt: "2026-04-15 23:59",
      sold: 1180,
      status: "active",
    },
    {
      id: "TK-1402",
      title: "Shadow City Premiere",
      price: 89,
      expiresAt: "2026-04-18 23:59",
      sold: 760,
      status: "active",
    },
    {
      id: "TK-1317",
      title: "Legends of Dhaka",
      price: 69,
      expiresAt: "2026-03-28 23:59",
      sold: 942,
      status: "expired",
    },
  ],
  summary: {
    activeOffers: 2,
    grossRevenue: 177710,
  },
};

const uploadBlueprint: AdminUploadBlueprint = {
  languages: ["Bangla", "English", "Hindi"],
  genres: ["Drama", "Thriller", "Comedy", "Sports", "Documentary"],
  qualityPresets: ["4K + 1080p", "1080p + 720p", "720p only"],
  accessModes: ["subscription", "ticket", "hybrid"],
  minimumTiers: ["free", "basic", "standard", "premium"],
};

const dashboardSummary: AdminDashboardSummary = {
  catalog: {
    totalTitles: 128,
    scheduled: 5,
    hybridAccessTitles: 19,
    openTickets: 26,
  },
  readiness: [
    {
      label: "Content schema",
      percent: 65,
    },
    {
      label: "Upload pipeline",
      percent: 48,
    },
    {
      label: "Entitlement flexibility",
      percent: 61,
    },
  ],
  pipeline: [
    {
      queue: "Drafts waiting metadata",
      count: 12,
      status: "Needs curation",
    },
    {
      queue: "Uploads in processing",
      count: 7,
      status: "Encoding and QA",
    },
    {
      queue: "Scheduled releases",
      count: 5,
      status: "Auto publish ready",
    },
    {
      queue: "Ticket campaigns",
      count: 3,
      status: "Expiry monitoring",
    },
  ],
};

function buildAdminId(prefix: string, padding: number, existingIds: string[]): string {
  const nextSequence = existingIds
    .map((value) => {
      const match = value.match(/(\d+)$/);
      return match ? Number(match[1]) : 0;
    })
    .reduce((max, current) => (current > max ? current : max), 0) + 1;

  return `${prefix}${String(nextSequence).padStart(padding, "0")}`;
}

function normalizeDateTime(value: string): string {
  return value.includes("T") ? value.replace("T", " ") : value;
}

function recomputeContentSummary(): void {
  contentCatalog.summary = {
    total: contentCatalog.items.length,
    drafts: contentCatalog.items.filter((item) => item.status === "draft").length,
    scheduled: contentCatalog.items.filter((item) => item.status === "scheduled").length,
    hybrid: contentCatalog.items.filter((item) => item.accessMode === "hybrid").length,
  };
}

function recomputeTicketSummary(): void {
  ticketSalesOverview.summary = {
    activeOffers: ticketSalesOverview.offers.filter((offer) => offer.status === "active").length,
    grossRevenue: ticketSalesOverview.offers.reduce(
      (total, offer) => total + offer.price * offer.sold,
      0,
    ),
  };
}

export async function getAdminContentCatalogUseCase(): Promise<AdminContentCatalog> {
  return contentCatalog;
}

export async function getAdminSubscriptionsOverviewUseCase(): Promise<AdminSubscriptionOverview> {
  return subscriptionsOverview;
}

export async function getAdminTicketSalesOverviewUseCase(): Promise<AdminTicketSalesOverview> {
  return ticketSalesOverview;
}

export async function getAdminAuditLogEventsUseCase(): Promise<AdminAuditLogEvent[]> {
  return listAdminAuditLogEventsRepository();
}

export async function getAdminFeatureFlagsUseCase(): Promise<AdminFeatureFlag[]> {
  return listAdminFeatureFlagsRepository();
}

export async function getAdminUploadBlueprintUseCase(): Promise<AdminUploadBlueprint> {
  return uploadBlueprint;
}

export async function getAdminDashboardSummaryUseCase(): Promise<AdminDashboardSummary> {
  return dashboardSummary;
}

export async function createAdminUploadDraftUseCase(
  rawInput: unknown,
  actorId: string,
): Promise<AdminUploadDraft> {
  const input = createAdminUploadDraftSchema.parse(rawInput);
  const draft = await createAdminUploadDraftRepository(input, actorId);

  await createAdminAuditLog({
    actorId,
    action: "upload.draft.create",
    targetType: "upload_draft",
    targetId: draft.id,
    metadata: {
      slug: draft.slug,
      accessMode: draft.accessMode,
      minimumTier: draft.minimumTier,
    },
  });

  return draft;
}

export async function createAdminContentDraftUseCase(
  rawInput: unknown,
  actorId: string,
): Promise<AdminContentItem> {
  const input = createAdminContentDraftSchema.parse(rawInput);

  const draft: AdminContentItem = {
    id: buildAdminId("CNT-2026-", 3, contentCatalog.items.map((item) => item.id)),
    title: input.title,
    format: input.format,
    status: "draft",
    accessMode: input.accessMode,
    quality: input.quality,
    publishAt: input.publishAt,
    owner: input.owner,
  };

  contentCatalog.items.unshift(draft);
  recomputeContentSummary();

  await createAdminAuditLog({
    actorId,
    action: "content.draft.create",
    targetType: "content",
    targetId: draft.id,
    metadata: {
      title: draft.title,
      accessMode: draft.accessMode,
      status: draft.status,
    },
  });

  dashboardSummary.catalog.totalTitles += 1;
  dashboardSummary.pipeline = dashboardSummary.pipeline.map((queue) =>
    queue.queue.toLowerCase().includes("draft")
      ? { ...queue, count: queue.count + 1 }
      : queue,
  );

  return draft;
}

export async function updateAdminContentDraftUseCase(
  contentId: string,
  rawInput: unknown,
  actorId: string,
): Promise<AdminContentItem> {
  const input = updateAdminContentDraftSchema.parse(rawInput);

  const item = contentCatalog.items.find((entry) => entry.id === contentId);

  if (!item) {
    throw new AppError("Content item not found.", {
      code: API_ERROR_CODES.NOT_FOUND,
      expose: true,
    });
  }

  Object.assign(item, input);
  recomputeContentSummary();

  await createAdminAuditLog({
    actorId,
    action: "content.draft.update",
    targetType: "content",
    targetId: item.id,
    metadata: {
      updatedFields: Object.keys(input),
    },
  });

  return item;
}

export async function createAdminTicketOfferUseCase(
  rawInput: unknown,
  actorId: string,
): Promise<AdminTicketOffer> {
  const input = createAdminTicketOfferSchema.parse(rawInput);

  const offer: AdminTicketOffer = {
    id: buildAdminId("TK-", 4, ticketSalesOverview.offers.map((item) => item.id)),
    title: input.title,
    price: Math.round(input.price),
    expiresAt: normalizeDateTime(input.expiresAt),
    sold: 0,
    status: "active",
  };

  ticketSalesOverview.offers.unshift(offer);
  recomputeTicketSummary();

  await createAdminAuditLog({
    actorId,
    action: "ticket.offer.create",
    targetType: "ticket_offer",
    targetId: offer.id,
    metadata: {
      title: offer.title,
      price: offer.price,
      expiresAt: offer.expiresAt,
    },
  });

  dashboardSummary.catalog.openTickets = ticketSalesOverview.summary.activeOffers;

  return offer;
}

export async function saveAdminFeatureFlagsUseCase(
  rawInput: unknown,
  actorId: string,
): Promise<AdminFeatureFlag[]> {
  const input = saveAdminFeatureFlagsSchema.parse(rawInput);

  const { flags, missingFlagIds } = await saveAdminFeatureFlagsRepository(input.flags);

  if (missingFlagIds.length > 0) {
    throw new AppError("Some feature flags do not exist.", {
      code: API_ERROR_CODES.NOT_FOUND,
      expose: true,
      details: {
        missingFlagIds,
      },
    });
  }

  await createAdminAuditLog({
    actorId,
    action: "settings.flags.save",
    targetType: "settings",
    targetId: "feature_flags",
    metadata: {
      updatedFlags: input.flags,
    },
  });

  return flags;
}
