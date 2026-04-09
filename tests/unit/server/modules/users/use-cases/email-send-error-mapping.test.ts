import { beforeEach, describe, expect, it, vi } from "vitest";

import { requestPasswordResetUseCase } from "@/server/modules/users/use-cases/request-password-reset.use-case";
import { resendEmailCodeUseCase } from "@/server/modules/users/use-cases/resend-email-code.use-case";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";

const mocks = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
  deleteAuthCodesForIdentifier: vi.fn(),
  createAuthCode: vi.fn(),
  sendAuthCodeEmail: vi.fn(),
}));

vi.mock("@/server/modules/users/repositories/user-auth.repository", () => ({
  findUserByEmail: mocks.findUserByEmail,
  deleteAuthCodesForIdentifier: mocks.deleteAuthCodesForIdentifier,
  createAuthCode: mocks.createAuthCode,
}));

vi.mock("@/lib/email/auth-mailer", () => ({
  sendAuthCodeEmail: mocks.sendAuthCodeEmail,
}));

describe("auth use-case email error mapping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUserByEmail.mockResolvedValue({
      id: "user_1",
      emailVerified: null,
    });
    mocks.deleteAuthCodesForIdentifier.mockResolvedValue(undefined);
    mocks.createAuthCode.mockResolvedValue({ id: "code_1" });
    mocks.sendAuthCodeEmail.mockRejectedValue({
      code: "EAUTH",
      responseCode: 535,
      message: "Invalid login",
    });
  });

  it("throws EMAIL_SERVICE_UNAVAILABLE for resend-code SMTP failure", async () => {
    await expect(
      resendEmailCodeUseCase({ email: "demo@example.com" }),
    ).rejects.toMatchObject({
      code: API_ERROR_CODES.EMAIL_SERVICE_UNAVAILABLE,
    });
  });

  it("throws EMAIL_SERVICE_UNAVAILABLE for forgot-password SMTP failure", async () => {
    await expect(
      requestPasswordResetUseCase({ email: "demo@example.com" }),
    ).rejects.toMatchObject({
      code: API_ERROR_CODES.EMAIL_SERVICE_UNAVAILABLE,
    });
  });
});
