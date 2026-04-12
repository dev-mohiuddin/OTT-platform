import "server-only";

import { cookies, headers } from "next/headers";

import { createApiClient, type ApiClient } from "@/lib/http/client/api-client";

function withOptionalHeader(
  target: Record<string, string>,
  key: string,
  value: string | null,
): void {
  if (value && value.trim().length > 0) {
    target[key] = value;
  }
}

export async function createServerApiClient(): Promise<ApiClient> {
  const headerStore = await headers();
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const forwardedHeaders: Record<string, string> = {};

  withOptionalHeader(forwardedHeaders, "cookie", cookieHeader || null);
  withOptionalHeader(forwardedHeaders, "authorization", headerStore.get("authorization"));
  withOptionalHeader(forwardedHeaders, "x-request-id", headerStore.get("x-request-id"));
  withOptionalHeader(forwardedHeaders, "x-trace-id", headerStore.get("x-trace-id"));
  withOptionalHeader(forwardedHeaders, "accept-language", headerStore.get("accept-language"));
  withOptionalHeader(forwardedHeaders, "x-country-code", headerStore.get("x-country-code"));
  withOptionalHeader(forwardedHeaders, "x-currency", headerStore.get("x-currency"));

  return createApiClient({
    baseUrl: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    defaultHeaders: forwardedHeaders,
  });
}
