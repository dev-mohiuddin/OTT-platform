import { describe, expect, it } from "vitest";

import { getClientEnv } from "@/config/env/client-env";
import { getAuthEnvRequired, getServerEnv, getSmtpEnvRequired } from "@/config/env/server-env";

describe("config/env", () => {
  it("parses server env with defaults", () => {
    const env = getServerEnv({});

    expect(env.NODE_ENV).toBe("development");
    expect(env.DEFAULT_COUNTRY_CODE).toBe("BD");
    expect(env.DEFAULT_LOCALE).toBe("bn-BD");
    expect(env.DEFAULT_CURRENCY).toBe("BDT");
    expect(env.LOG_LEVEL).toBe("info");
  });

  it("parses client env with defaults", () => {
    const env = getClientEnv({});

    expect(env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE).toBe("BD");
    expect(env.NEXT_PUBLIC_DEFAULT_LOCALE).toBe("bn-BD");
    expect(env.NEXT_PUBLIC_DEFAULT_CURRENCY).toBe("BDT");
    expect(env.NEXT_PUBLIC_LOG_LEVEL).toBe("info");
  });

  it("coerces SMTP_SECURE string to boolean", () => {
    const envTrue = getServerEnv({ SMTP_SECURE: "true" });
    const envFalse = getServerEnv({ SMTP_SECURE: "false" });

    expect(envTrue.SMTP_SECURE).toBe(true);
    expect(envFalse.SMTP_SECURE).toBe(false);
  });

  it("parses AUTH_TRUST_HOST as optional boolean", () => {
    const envTrue = getServerEnv({ AUTH_TRUST_HOST: "true" });
    const envFalse = getServerEnv({ AUTH_TRUST_HOST: "false" });
    const envUnset = getServerEnv({});

    expect(envTrue.AUTH_TRUST_HOST).toBe(true);
    expect(envFalse.AUTH_TRUST_HOST).toBe(false);
    expect(envUnset.AUTH_TRUST_HOST).toBeUndefined();
  });

  it("parses GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING as optional boolean", () => {
    const envTrue = getServerEnv({ GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING: "true" });
    const envFalse = getServerEnv({ GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING: "false" });
    const envUnset = getServerEnv({});

    expect(envTrue.GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING).toBe(true);
    expect(envFalse.GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING).toBe(false);
    expect(envUnset.GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING).toBeUndefined();
  });

  it("requires auth env in auth runtime helper", () => {
    const env = getAuthEnvRequired({
      DATABASE_URL: "postgresql://localhost:5432/ott_platform",
      NEXTAUTH_URL: "http://localhost:3000",
      NEXTAUTH_SECRET: "super-secret",
      GOOGLE_CLIENT_ID: "id-123",
      GOOGLE_CLIENT_SECRET: "secret-123",
    });

    expect(env.NEXTAUTH_SECRET).toBe("super-secret");
  });

  it("throws when NEXTAUTH_URL is missing in auth runtime helper", () => {
    expect(() => {
      getAuthEnvRequired({
        DATABASE_URL: "postgresql://localhost:5432/ott_platform",
        NEXTAUTH_SECRET: "super-secret",
        GOOGLE_CLIENT_ID: "id-123",
        GOOGLE_CLIENT_SECRET: "secret-123",
      });
    }).toThrow("Missing NEXTAUTH_URL in server environment.");
  });

  it("requires smtp env in smtp runtime helper", () => {
    const env = getSmtpEnvRequired({
      SMTP_USER: "mailer@example.com",
      SMTP_PASS: "app-password",
      SMTP_FROM: "mailer@example.com",
    });

    expect(env.SMTP_FROM).toBe("mailer@example.com");
  });
});