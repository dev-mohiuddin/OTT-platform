interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  error?: {
    message?: string;
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function callAdminApi<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || payload.success === false) {
    const errorMessage = payload.success === false ? payload.error?.message : undefined;
    throw new Error(errorMessage ?? "Request failed.");
  }

  return payload.data;
}

export const fetchAdminDashboardSummary = () =>
  callAdminApi<import("@/components/ott/admin/types").AdminDashboardSummary>("/api/v1/admin/dashboard/summary");

export const fetchAdminContentCatalog = () =>
  callAdminApi<import("@/components/ott/admin/types").AdminContentCatalog>("/api/v1/admin/content");

export const createAdminContentDraft = (
  payload: import("@/components/ott/admin/types").AdminCreateContentDraftInput,
) =>
  callAdminApi<import("@/components/ott/admin/types").AdminContentItem>("/api/v1/admin/content", {
    method: "POST",
    body: payload,
  });

export const updateAdminContentDraft = (
  contentId: string,
  payload: import("@/components/ott/admin/types").AdminUpdateContentDraftInput,
) =>
  callAdminApi<import("@/components/ott/admin/types").AdminContentItem>(
    `/api/v1/admin/content/${encodeURIComponent(contentId)}`,
    {
      method: "PATCH",
      body: payload,
    },
  );

export const fetchAdminSubscriptionsOverview = () =>
  callAdminApi<import("@/components/ott/admin/types").AdminSubscriptionOverview>("/api/v1/admin/subscriptions/plans");

export const fetchAdminTicketSalesOverview = () =>
  callAdminApi<import("@/components/ott/admin/types").AdminTicketSalesOverview>("/api/v1/admin/tickets/offers");

export const createAdminTicketOffer = (
  payload: import("@/components/ott/admin/types").AdminCreateTicketOfferInput,
) =>
  callAdminApi<import("@/components/ott/admin/types").AdminTicketOffer>("/api/v1/admin/tickets/offers", {
    method: "POST",
    body: payload,
  });

export const fetchAdminAuditLogEvents = () =>
  callAdminApi<import("@/components/ott/admin/types").AdminAuditLogEvent[]>("/api/v1/admin/audit-logs");

export const fetchAdminFeatureFlags = () =>
  callAdminApi<import("@/components/ott/admin/types").AdminFeatureFlag[]>("/api/v1/admin/settings/flags");

export const saveAdminFeatureFlags = (
  payload: import("@/components/ott/admin/types").AdminSaveFeatureFlagsInput,
) =>
  callAdminApi<import("@/components/ott/admin/types").AdminFeatureFlag[]>("/api/v1/admin/settings/flags", {
    method: "PUT",
    body: payload,
  });

export const fetchAdminUploadBlueprint = () =>
  callAdminApi<import("@/components/ott/admin/types").AdminUploadBlueprint>("/api/v1/admin/upload/blueprints");

export const createAdminUploadDraft = (
  payload: import("@/components/ott/admin/types").AdminCreateUploadDraftInput,
) =>
  callAdminApi<import("@/components/ott/admin/types").AdminUploadDraft>("/api/v1/admin/upload/drafts", {
    method: "POST",
    body: payload,
  });
