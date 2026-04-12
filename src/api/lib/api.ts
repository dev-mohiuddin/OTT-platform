import { createApiClient } from "@/lib/http/client/api-client";
import { ClientHttpError } from "@/lib/http/errors/client-error";
import { resolveRequestErrorMessage } from "@/api/lib/error-message";

export interface ApiRequestSuccess<TData> {
  success: true;
  data: TData;
}

export interface ApiRequestFailure {
  success: false;
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
  requestId?: string;
  traceId?: string;
}

export type ApiRequestResult<TData> = ApiRequestSuccess<TData> | ApiRequestFailure;

function resolveApiBaseUrl(): string | undefined {
  if (typeof window !== "undefined") {
    return undefined;
  }

  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

function resolveBrowserAuthToken(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage.getItem("token") ?? undefined;
}

const API = createApiClient({
  baseUrl: resolveApiBaseUrl(),
  getAuthToken: () => resolveBrowserAuthToken(),
});

function toFailure(error: unknown): ApiRequestFailure {
  if (error instanceof ClientHttpError) {
    return {
      success: false,
      message: resolveRequestErrorMessage(error),
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      requestId: error.requestId,
      traceId: error.traceId,
    };
  }

  return {
    success: false,
    message: resolveRequestErrorMessage(error),
  };
}

export async function handleRequest<TData>(
  requestFn: () => Promise<TData>,
): Promise<ApiRequestResult<TData>> {
  try {
    const data = await requestFn();

    return {
      success: true,
      data,
    };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export function isRequestSuccess<TData>(
  result: ApiRequestResult<TData>,
): result is ApiRequestSuccess<TData> {
  return result.success;
}

export default API;
