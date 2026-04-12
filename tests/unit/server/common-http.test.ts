import { describe, expect, it } from "vitest";

import { HTTP_STATUS } from "@/server/common/constants/http-status";
import { AppError } from "@/server/common/errors/app-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";
import { createErrorEnvelope } from "@/server/common/http/error-envelope";
import { withApiHandler } from "@/server/common/http/route-handler";
import { createSuccessEnvelope } from "@/server/common/http/success-envelope";

describe("server/common/http", () => {
  it("creates a success envelope with standard meta", () => {
    const result = createSuccessEnvelope(
      {
        ok: true,
      },
      {
        requestId: "req_abc1234567",
        traceId: "0123456789abcdef0123456789abcdef",
        method: "GET",
        path: "/api/v1/health",
      },
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ ok: true });
    expect(result.meta.requestId).toBe("req_abc1234567");
    expect(result.meta.version).toBe("v1");
    expect(result.meta.method).toBe("GET");
    expect(result.meta.path).toBe("/api/v1/health");
  });

  it("creates an exposed error envelope from AppError", () => {
    const error = new AppError("Resource not found", {
      code: API_ERROR_CODES.NOT_FOUND,
      statusCode: HTTP_STATUS.NOT_FOUND,
      expose: true,
      details: {
        id: "title_1",
      },
    });

    const envelope = createErrorEnvelope(error, {
      requestId: "req_abc1234567",
      traceId: "0123456789abcdef0123456789abcdef",
      method: "GET",
      path: "/api/v1/admin",
    });

    expect(envelope.success).toBe(false);
    expect(envelope.error.code).toBe(API_ERROR_CODES.NOT_FOUND);
    expect(envelope.error.message).toBe("Resource not found");
    expect(envelope.error.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(envelope.error.details).toEqual({ id: "title_1" });
    expect(envelope.meta.method).toBe("GET");
    expect(envelope.meta.path).toBe("/api/v1/admin");
  });

  it("wraps route handlers in a consistent success response", async () => {
    const handler = withApiHandler(async () => {
      return {
        data: {
          health: "ok",
        },
        statusCode: HTTP_STATUS.CREATED,
      };
    });

    const response = await handler(
      new Request("https://example.com/api/v1/health", {
        method: "GET",
        headers: {
          "x-request-id": "req_abc1234567",
          "x-trace-id": "0123456789abcdef0123456789abcdef",
          "accept-language": "bn-BD",
          "x-country-code": "BD",
          "x-currency": "BDT",
        },
      }),
      {},
    );

    const payload = (await response.json()) as {
      success: boolean;
      data: { health: string };
      meta: { locale: string; country: string; currency: string; method: string; path: string };
    };

    expect(response.status).toBe(HTTP_STATUS.CREATED);
    expect(payload.success).toBe(true);
    expect(payload.data.health).toBe("ok");
    expect(payload.meta.locale).toBe("bn-BD");
    expect(payload.meta.country).toBe("BD");
    expect(payload.meta.currency).toBe("BDT");
    expect(payload.meta.method).toBe("GET");
    expect(payload.meta.path).toBe("/api/v1/health");
  });

  it("wraps thrown errors in a consistent error response", async () => {
    const handler = withApiHandler(async () => {
      throw new AppError("Forbidden area", {
        code: API_ERROR_CODES.FORBIDDEN,
        statusCode: HTTP_STATUS.FORBIDDEN,
        expose: true,
      });
    });

    const response = await handler(
      new Request("https://example.com/api/v1/admin", {
        method: "GET",
      }),
      {},
    );

    const payload = (await response.json()) as {
      success: boolean;
      error: {
        code: string;
        message: string;
        status: number;
      };
      meta: { requestId: string };
    };

    expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe(API_ERROR_CODES.FORBIDDEN);
    expect(payload.error.message).toBe("Forbidden area");
    expect(payload.meta.requestId).toBeTruthy();
  });

  it("adds pagination metadata automatically for array responses", async () => {
    const handler = withApiHandler(async () => {
      return {
        data: [
          { id: "role_1" },
          { id: "role_2" },
        ],
      };
    });

    const response = await handler(
      new Request("https://example.com/api/v1/admin/roles", {
        method: "GET",
      }),
      {},
    );

    const payload = (await response.json()) as {
      success: boolean;
      data: Array<{ id: string }>;
      meta: {
        pagination?: {
          page: number;
          limit: number;
          totalItems: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      };
    };

    expect(payload.success).toBe(true);
    expect(payload.data).toHaveLength(2);
    expect(payload.meta.pagination).toEqual({
      page: 1,
      limit: 2,
      totalItems: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
});