import { describe, expect, it } from "vitest";

import { isEmailTransportError, toEmailServiceAppError } from "@/lib/email/email-delivery";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";

describe("lib/email/email-delivery", () => {
  it("detects SMTP auth errors", () => {
    const error = {
      code: "EAUTH",
      responseCode: 535,
      message: "Invalid login: 535 Username and Password not accepted",
    };

    expect(isEmailTransportError(error)).toBe(true);
  });

  it("detects connection timeout errors", () => {
    const error = {
      code: "ETIMEDOUT",
      message: "Connection timeout",
    };

    expect(isEmailTransportError(error)).toBe(true);
  });

  it("detects DNS lookup failures", () => {
    const error = new Error("getaddrinfo ENOTFOUND smtp.invalid-host.test");

    expect(isEmailTransportError(error)).toBe(true);
  });

  it("returns false for unknown non-email errors", () => {
    const error = new Error("Unexpected parsing issue");

    expect(isEmailTransportError(error)).toBe(false);
  });

  it("maps email transport failure to typed app error", () => {
    const appError = toEmailServiceAppError(new Error("SMTP down"));

    expect(appError.code).toBe(API_ERROR_CODES.EMAIL_SERVICE_UNAVAILABLE);
    expect(appError.expose).toBe(true);
  });
});
