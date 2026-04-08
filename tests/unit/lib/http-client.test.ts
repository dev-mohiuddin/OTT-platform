import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "@/lib/http/client/api-client";
import { ClientHttpError } from "@/lib/http/errors/client-error";

describe("lib/http/client/api-client", () => {
  it("returns unwrapped data for success envelopes", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: { health: "ok" },
          meta: {
            requestId: "req_abc1234567",
            timestamp: "2026-04-09T00:00:00.000Z",
            version: "v1",
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetcher: mockFetch as unknown as typeof fetch,
      localeDefaults: {
        locale: "bn-BD",
        countryCode: "BD",
        currency: "BDT",
      },
    });

    const data = await client.get<{ health: string }>("/health");

    expect(data).toEqual({ health: "ok" });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [, requestInit] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(requestInit.headers);
    expect(headers.get("accept-language")).toBe("bn-BD");
    expect(headers.get("x-country-code")).toBe("BD");
    expect(headers.get("x-currency")).toBe("BDT");
  });

  it("throws ClientHttpError for API error envelopes", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Invalid payload",
            status: 400,
          },
          meta: {
            requestId: "req_abc1234567",
            timestamp: "2026-04-09T00:00:00.000Z",
            version: "v1",
          },
        }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetcher: mockFetch as unknown as typeof fetch,
    });

    await expect(client.post("/payments/init", { body: {} })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      statusCode: 400,
      message: "Invalid payload",
    });
  });

  it("converts network failures into ClientHttpError", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("network down"));

    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetcher: mockFetch as unknown as typeof fetch,
    });

    await expect(client.get("/health")).rejects.toBeInstanceOf(ClientHttpError);
    await expect(client.get("/health")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      statusCode: 0,
    });
  });
});