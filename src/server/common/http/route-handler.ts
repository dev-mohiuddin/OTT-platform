import { HTTP_STATUS, type HttpStatusCode } from "@/server/common/constants/http-status";
import type { PaginationMeta } from "@/server/common/contracts/pagination.contract";
import { createRequestContext, type CreateRequestContextOptions, type RequestContext } from "@/server/common/context/request-context";
import { createAppErrorFromUnknown } from "@/server/common/errors/app-error";
import { createErrorEnvelope } from "@/server/common/http/error-envelope";
import { createSuccessEnvelope } from "@/server/common/http/success-envelope";
import { serverLogger, type ServerLogger } from "@/server/common/logging/server-logger";

export interface RouteHandlerOutput<TData> {
  data: TData;
  statusCode?: HttpStatusCode;
  pagination?: PaginationMeta;
}

export type ApiRouteHandler<TData, TContext = unknown> = (
  request: Request,
  context: TContext,
  requestContext: RequestContext,
) => Promise<RouteHandlerOutput<TData> | Response> | RouteHandlerOutput<TData> | Response;

export interface ApiHandlerOptions {
  logger?: ServerLogger;
  requestContext?: Omit<CreateRequestContextOptions, "requestId" | "traceId">;
}

export function withApiHandler<TData, TContext = unknown>(
  handler: ApiRouteHandler<TData, TContext>,
  options: ApiHandlerOptions = {},
): (request: Request, context: TContext) => Promise<Response> {
  const logger = options.logger ?? serverLogger;

  return async (request, context) => {
    const requestContext = createRequestContext(request, {
      now: options.requestContext?.now,
      localeDefaults: options.requestContext?.localeDefaults,
    });

    try {
      const result = await handler(request, context, requestContext);

      if (result instanceof Response) {
        return result;
      }

      const statusCode = result.statusCode ?? HTTP_STATUS.OK;
      const payload = createSuccessEnvelope(result.data, {
        requestId: requestContext.requestId,
        traceId: requestContext.traceId,
        timestamp: requestContext.timestamp,
        locale: requestContext.locale,
        country: requestContext.country,
        currency: requestContext.currency,
        pagination: result.pagination,
      });

      return Response.json(payload, {
        status: statusCode,
      });
    } catch (error: unknown) {
      const appError = createAppErrorFromUnknown(error);

      logger.error("Route handler failed", {
        requestId: requestContext.requestId,
        traceId: requestContext.traceId,
        path: requestContext.path,
        method: requestContext.method,
        statusCode: appError.statusCode,
        errorCode: appError.code,
        error,
      });

      const payload = createErrorEnvelope(appError, {
        requestId: requestContext.requestId,
        traceId: requestContext.traceId,
        timestamp: requestContext.timestamp,
        locale: requestContext.locale,
        country: requestContext.country,
        currency: requestContext.currency,
      });

      return Response.json(payload, {
        status: appError.statusCode,
      });
    }
  };
}