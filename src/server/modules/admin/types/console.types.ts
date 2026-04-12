export type AdminContentStatus = "draft" | "scheduled" | "published" | "archived";
export type AdminContentFormat = "Movie" | "Series";
export type AdminAccessMode = "subscription" | "ticket" | "hybrid";

export interface AdminContentItem {
  id: string;
  title: string;
  format: AdminContentFormat;
  status: AdminContentStatus;
  accessMode: AdminAccessMode;
  quality: string;
  publishAt: string;
  owner: string;
}

export interface AdminContentSummary {
  total: number;
  drafts: number;
  scheduled: number;
  hybrid: number;
}

export interface AdminContentCatalog {
  summary: AdminContentSummary;
  items: AdminContentItem[];
}

export interface CreateAdminContentDraftInput {
  title: string;
  format?: AdminContentFormat;
  accessMode?: AdminAccessMode;
  quality?: string;
  publishAt?: string;
  owner?: string;
}

export interface UpdateAdminContentDraftInput {
  title?: string;
  format?: AdminContentFormat;
  status?: AdminContentStatus;
  accessMode?: AdminAccessMode;
  quality?: string;
  publishAt?: string;
  owner?: string;
}

export interface AdminSubscriptionPlan {
  slug: string;
  price: string;
  activeSubscribers: number;
  entitlement: string;
}

export interface AdminSubscriptionLifecycleEvent {
  event: string;
  count: number;
  window: string;
}

export interface AdminSubscriptionOverview {
  plans: AdminSubscriptionPlan[];
  lifecycle: AdminSubscriptionLifecycleEvent[];
}

export interface AdminTicketOffer {
  id: string;
  title: string;
  price: number;
  expiresAt: string;
  sold: number;
  status: "active" | "expired";
}

export interface AdminTicketSalesOverview {
  offers: AdminTicketOffer[];
  summary: {
    activeOffers: number;
    grossRevenue: number;
  };
}

export interface CreateAdminTicketOfferInput {
  title: string;
  price: number;
  expiresAt: string;
}

export interface AdminAuditLogEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export interface AdminFeatureFlag {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface SaveAdminFeatureFlagsInput {
  flags: Array<{
    id: string;
    enabled: boolean;
  }>;
}

export interface AdminUploadBlueprint {
  languages: string[];
  genres: string[];
  qualityPresets: string[];
  accessModes: AdminAccessMode[];
  minimumTiers: Array<"free" | "basic" | "standard" | "premium">;
}

export interface CreateAdminUploadDraftInput {
  title: string;
  slug: string;
  synopsis: string;
  thumbnailUrl: string;
  sourceFileName: string;
  language: string;
  genre: string;
  qualityPreset: string;
  accessMode: AdminAccessMode;
  minimumTier: "free" | "basic" | "standard" | "premium";
  ticketPrice?: number;
  ticketExpiresAt?: string;
  isFeatured?: boolean;
  isKidsSafe?: boolean;
  allowPreview?: boolean;
}

export interface AdminUploadDraft {
  id: string;
  title: string;
  slug: string;
  accessMode: AdminAccessMode;
  minimumTier: "free" | "basic" | "standard" | "premium";
  status: "draft";
  createdAt: string;
}

export interface AdminDashboardReadinessItem {
  label: string;
  percent: number;
}

export interface AdminDashboardPipelineItem {
  queue: string;
  count: number;
  status: string;
}

export interface AdminDashboardSummary {
  catalog: {
    totalTitles: number;
    scheduled: number;
    hybridAccessTitles: number;
    openTickets: number;
  };
  readiness: AdminDashboardReadinessItem[];
  pipeline: AdminDashboardPipelineItem[];
}
