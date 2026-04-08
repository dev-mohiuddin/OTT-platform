import { describe, expect, it } from "vitest";

import { createRequestContext } from "@/server/common/context/request-context";

describe("server/common/context/request-context", () => {
  it("builds request context from headers", () => {
    const request = new Request("https://example.com/api/v1/content", {
      method: "POST",
      headers: {
        "x-request-id": "req_abc1234567",
        "x-trace-id": "0123456789abcdef0123456789abcdef",
        "x-forwarded-for": "10.10.10.10, 127.0.0.1",
        "user-agent": "vitest-agent",
        "accept-language": "bn-BD",
        "x-country-code": "BD",
        "x-currency": "BDT",
      },
    });

    const context = createRequestContext(request);

    expect(context.requestId).toBe("req_abc1234567");
    expect(context.traceId).toBe("0123456789abcdef0123456789abcdef");
    expect(context.ipAddress).toBe("10.10.10.10");
    expect(context.userAgent).toBe("vitest-agent");
    expect(context.method).toBe("POST");
    expect(context.path).toBe("/api/v1/content");
    expect(context.locale).toBe("bn-BD");
    expect(context.country).toBe("BD");
    expect(context.currency).toBe("BDT");
  });

  it("falls back to defaults when no locale headers are provided", () => {
    const request = new Request("https://example.com/api/v1/content", {
      method: "GET",
    });

    const context = createRequestContext(request, {
      localeDefaults: {
        countryCode: "IN",
        locale: "hi-IN",
        currency: "INR",
      },
    });

    expect(context.country).toBe("IN");
    expect(context.locale).toBe("hi-IN");
    expect(context.currency).toBe("INR");
  });
});