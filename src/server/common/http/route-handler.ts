import { type HttpStatusCode } from "@/server/common/constants/http-status";
import type { PaginationMeta } from "@/server/common/contracts/pagination.contract";
import { createRequestContext, type CreateRequestContextOptions, type RequestContext } from "@/server/common/context/request-context";
import { createAppErrorFromUnknown } from "@/server/common/errors/app-error";
import { createErrorJsonResponse, createSuccessJsonResponse } from "@/server/common/http/json-response";
import { enforceRateLimit } from "@/server/common/http/rate-limit";
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
      await enforceRateLimit(requestContext);

      const result = await handler(request, context, requestContext);

      if (result instanceof Response) {
        return result;
      }

      return createSuccessJsonResponse(result.data, requestContext, {
        statusCode: result.statusCode,
        pagination: result.pagination,
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

      return createErrorJsonResponse(appError, requestContext);
    }
  };
}