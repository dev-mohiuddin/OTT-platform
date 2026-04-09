import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerUserUseCase } from "@/server/modules/users/use-cases/register-user.use-case";

const mocks = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
  findUserByPhone: vi.fn(),
  createUserWithPassword: vi.fn(),
  assignRoleToUserBySlug: vi.fn(),
  deleteAuthCodesForIdentifier: vi.fn(),
  createAuthCode: vi.fn(),
  sendAuthCodeEmail: vi.fn(),
}));

vi.mock("@/server/modules/users/repositories/user-auth.repository", () => ({
  findUserByEmail: mocks.findUserByEmail,
  findUserByPhone: mocks.findUserByPhone,
  createUserWithPassword: mocks.createUserWithPassword,
  assignRoleToUserBySlug: mocks.assignRoleToUserBySlug,
  deleteAuthCodesForIdentifier: mocks.deleteAuthCodesForIdentifier,
  createAuthCode: mocks.createAuthCode,
}));

vi.mock("@/lib/email/auth-mailer", () => ({
  sendAuthCodeEmail: mocks.sendAuthCodeEmail,
}));

describe("registerUserUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUserByEmail.mockResolvedValue(null);
    mocks.findUserByPhone.mockResolvedValue(null);
    mocks.createUserWithPassword.mockResolvedValue({ id: "user_1" });
    mocks.assignRoleToUserBySlug.mockResolvedValue(undefined);
    mocks.deleteAuthCodesForIdentifier.mockResolvedValue(undefined);
    mocks.createAuthCode.mockResolvedValue({ id: "code_1" });
    mocks.sendAuthCodeEmail.mockResolvedValue(undefined);
  });

  it("returns success when email delivery succeeds", async () => {
    const result = await registerUserUseCase({
      method: "email",
      fullName: "Demo User",
      email: "demo@example.com",
      password: "StrongPass123!",
    });

    expect(result.userId).toBe("user_1");
    expect(result.requiresEmailVerification).toBe(true);
    expect(result.emailSent).toBe(true);
    expect(result.warning).toBeUndefined();
  });

  it("keeps signup successful when SMTP transport fails", async () => {
    mocks.sendAuthCodeEmail.mockRejectedValue({
      code: "EAUTH",
      responseCode: 535,
      message: "Invalid login",
    });

    const result = await registerUserUseCase({
      method: "email",
      fullName: "Demo User",
      email: "demo@example.com",
      password: "StrongPass123!",
    });

    expect(result.userId).toBe("user_1");
    expect(result.emailSent).toBe(false);
    expect(result.warning).toContain("Account created");
  });

  it("rethrows unknown non-email errors during send", async () => {
    mocks.sendAuthCodeEmail.mockRejectedValue(new Error("Unexpected template error"));

    await expect(
      registerUserUseCase({
        method: "email",
        fullName: "Demo User",
        email: "demo@example.com",
        password: "StrongPass123!",
      }),
    ).rejects.toThrow("Unexpected template error");
  });
});
