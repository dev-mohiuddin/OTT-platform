import type { RequestContext } from "@/server/common/context/request-context";
import {
  type PaginationMeta,
} from "@/server/common/contracts/pagination.contract";
import { HTTP_STATUS, type HttpStatusCode } from "@/server/common/constants/http-status";
import { createAppErrorFromUnknown } from "@/server/common/errors/app-error";
import { createErrorEnvelope } from "@/server/common/http/error-envelope";
import { createSuccessEnvelope } from "@/server/common/http/success-envelope";

type ResponseMetaContext = Pick<
  RequestContext,
  "requestId" | "traceId" | "timestamp" | "method" | "path" | "locale" | "country" | "currency"
>;

export interface SuccessJsonResponseOptions {
  statusCode?: HttpStatusCode;
  pagination?: PaginationMeta;
}

function resolvePaginationMeta<TData>(
  data: TData,
  explicitPagination?: PaginationMeta,
): PaginationMeta | undefined {
  if (explicitPagination) {
    return explicitPagination;
  }

  if (!Array.isArray(data)) {
    return undefined;
  }

  const totalItems = data.length;
  const normalizedLimit = totalItems > 0 ? totalItems : 1;

  return {
    page: 1,
    limit: normalizedLimit,
    totalItems,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

export function createSuccessJsonResponse<TData>(
  data: TData,
  context: ResponseMetaContext,
  options: SuccessJsonResponseOptions = {},
): Response {
  const payload = createSuccessEnvelope(data, {
    requestId: context.requestId,
    traceId: context.traceId,
    timestamp: context.timestamp,
    method: context.method,
    path: context.path,
    locale: context.locale,
    country: context.country,
    currency: context.currency,
    pagination: resolvePaginationMeta(data, options.pagination),
  });

  return Response.json(payload, {
    status: options.statusCode ?? HTTP_STATUS.OK,
  });
}

export function createErrorJsonResponse(
  error: unknown,
  context: ResponseMetaContext,
): Response {
  const appError = createAppErrorFromUnknown(error);
  const payload = createErrorEnvelope(appError, {
    requestId: context.requestId,
    traceId: context.traceId,
    timestamp: context.timestamp,
    method: context.method,
    path: context.path,
    locale: context.locale,
    country: context.country,
    currency: context.currency,
  });

  return Response.json(payload, {
    status: appError.statusCode,
  });
}
