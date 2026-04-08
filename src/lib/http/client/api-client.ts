import { isApiErrorEnvelope } from "@/lib/http/contracts/error-envelope";
import { isApiSuccessEnvelope } from "@/lib/http/contracts/response-envelope";
import {
  ClientHttpError,
  createClientHttpErrorFromEnvelope,
} from "@/lib/http/errors/client-error";
import { resolveLocale, type LocaleResolutionDefaults } from "@/lib/i18n/locale";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryValue = string | number | boolean | null | undefined;

export interface ApiClientConfig {
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
  getAuthToken?: () => Promise<string | undefined> | string | undefined;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  localeDefaults?: LocaleResolutionDefaults;
}

export interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod;
  query?: Record<string, QueryValue>;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
  locale?: string;
  countryCode?: string;
  currency?: string;
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function appendQuery(path: string, query: Record<string, QueryValue> | undefined): string {
  if (!query || Object.keys(query).length === 0) {
    return path;
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue;
    }

    params.set(key, String(value));
  }

  const queryString = params.toString();
  if (!queryString) {
    return path;
  }

  return `${path}${path.includes("?") ? "&" : "?"}${queryString}`;
}

function normalizeBaseUrl(baseUrl: string | undefined): string | undefined {
  if (!baseUrl) {
    return undefined;
  }

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function mergeHeaders(...headerSets: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();

  for (const headerSet of headerSets) {
    if (!headerSet) {
      continue;
    }

    const current = new Headers(headerSet);
    current.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function canBeJsonBody(value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === "string") {
    return false;
  }

  if (typeof FormData !== "undefined" && value instanceof FormData) {
    return false;
  }

  if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) {
    return false;
  }

  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return false;
  }

  if (value instanceof ArrayBuffer) {
    return false;
  }

  return typeof value === "object";
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (contentType.startsWith("text/")) {
    return response.text();
  }

  return null;
}

export class ApiClient {
  private readonly config: ApiClientConfig;
  private readonly fetcher: typeof fetch;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      timeoutMs: 15000,
      ...config,
      baseUrl: normalizeBaseUrl(config.baseUrl),
    };
    this.fetcher = config.fetcher ?? fetch;
  }

  async request<TResponse, TBody = unknown>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const method = options.method ?? "GET";
    const locale = resolveLocale(
      {
        locale: options.locale,
        countryCode: options.countryCode,
        currency: options.currency,
      },
      this.config.localeDefaults,
    );

    const normalizedPath = appendQuery(path, options.query);
    const url = isAbsoluteUrl(normalizedPath)
      ? normalizedPath
      : this.config.baseUrl
        ? `${this.config.baseUrl}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`
        : normalizedPath;

    const headers = mergeHeaders(this.config.defaultHeaders, options.headers);
    headers.set("accept", headers.get("accept") ?? "application/json");
    headers.set("accept-language", locale.locale);
    headers.set("x-country-code", locale.countryCode);
    headers.set("x-currency", locale.currency);

    const authToken = await this.config.getAuthToken?.();
    if (authToken && !headers.has("authorization")) {
      headers.set("authorization", `Bearer ${authToken}`);
    }

    let requestBody: BodyInit | undefined;
    if (canBeJsonBody(options.body)) {
      requestBody = JSON.stringify(options.body);
      if (!headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }
    } else if (options.body !== undefined && options.body !== null) {
      requestBody = options.body as BodyInit;
    }

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? this.config.timeoutMs ?? 15000;
    const externalSignal = options.signal;
    const abortListener = () => controller.abort();

    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener("abort", abortListener, { once: true });
      }
    }

    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    if (timeoutMs > 0) {
      timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
    }

    try {
      const response = await this.fetcher(url, {
        method,
        headers,
        body: requestBody,
        signal: controller.signal,
      });

      const body = await parseResponseBody(response);

      if (isApiErrorEnvelope(body)) {
        throw createClientHttpErrorFromEnvelope(body);
      }

      if (!response.ok) {
        throw new ClientHttpError(`HTTP request failed with status ${response.status}.`, {
          code: "HTTP_ERROR",
          statusCode: response.status,
          details: body,
        });
      }

      if (isApiSuccessEnvelope<TResponse>(body)) {
        return body.data;
      }

      return body as TResponse;
    } catch (error: unknown) {
      if (error instanceof ClientHttpError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ClientHttpError("The request timed out.", {
          code: "REQUEST_TIMEOUT",
          statusCode: 408,
          cause: error,
        });
      }

      throw new ClientHttpError("Network request failed.", {
        code: "NETWORK_ERROR",
        statusCode: 0,
        cause: error,
      });
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }

      externalSignal?.removeEventListener("abort", abortListener);
    }
  }

  get<TResponse>(
    path: string,
    options: Omit<ApiRequestOptions<never>, "method" | "body"> = {},
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...options,
      method: "GET",
    });
  }

  post<TResponse, TBody = unknown>(
    path: string,
    options: Omit<ApiRequestOptions<TBody>, "method"> = {},
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(path, {
      ...options,
      method: "POST",
    });
  }

  put<TResponse, TBody = unknown>(
    path: string,
    options: Omit<ApiRequestOptions<TBody>, "method"> = {},
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(path, {
      ...options,
      method: "PUT",
    });
  }

  patch<TResponse, TBody = unknown>(
    path: string,
    options: Omit<ApiRequestOptions<TBody>, "method"> = {},
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(path, {
      ...options,
      method: "PATCH",
    });
  }

  delete<TResponse>(
    path: string,
    options: Omit<ApiRequestOptions<never>, "method" | "body"> = {},
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...options,
      method: "DELETE",
    });
  }
}

export function createApiClient(config: ApiClientConfig = {}): ApiClient {
  return new ApiClient(config);
}