import { describe, expect, it } from "vitest";

import { getClientEnv } from "@/config/env/client-env";
import {
  getAuthEnvRequired,
  getServerEnv,
  getSmtpEnvRequired,
} from "@/config/env/server-env";

describe("config/env", () => {
  it("parses server env with defaults", () => {
    const env = getServerEnv({});

    expect(env.NODE_ENV).toBe("development");
    expect(env.REDIS_ENABLED).toBe(true);
    expect(env.REDIS_TTL_ACCESS_SNAPSHOT_SECONDS).toBe(600);
    expect(env.REDIS_TTL_AUTH_ATTEMPT_SECONDS).toBe(900);
    expect(env.API_RATE_LIMIT_WINDOW_SECONDS).toBe(60);
    expect(env.API_RATE_LIMIT_MAX_REQUESTS).toBe(120);
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
      MONGODB_URI: "mongodb://localhost:27017/ott_platform",
      NEXTAUTH_SECRET: "super-secret",
    });

    expect(env.MONGODB_URI).toBe("mongodb://localhost:27017/ott_platform");
    expect(env.NEXTAUTH_SECRET).toBe("super-secret");
  });

  it("throws when NEXTAUTH_URL is missing in production auth runtime helper", () => {
    expect(() => {
      getAuthEnvRequired({
        NODE_ENV: "production",
        MONGODB_URI: "mongodb://localhost:27017/ott_platform",
        NEXTAUTH_SECRET: "super-secret",
      });
    }).toThrow("Missing NEXTAUTH_URL in server environment.");
  });

  it("throws when NEXTAUTH_URL is not https in production", () => {
    expect(() => {
      getAuthEnvRequired({
        NODE_ENV: "production",
        NEXTAUTH_URL: "http://example.com",
        MONGODB_URI: "mongodb://localhost:27017/ott_platform",
        NEXTAUTH_SECRET: "super-secret",
      });
    }).toThrow("NEXTAUTH_URL must use https in production environment.");
  });

  it("throws when NEXTAUTH_URL contains path, query, or hash", () => {
    expect(() => {
      getAuthEnvRequired({
        NEXTAUTH_URL: "http://localhost:3000/auth?x=1",
        MONGODB_URI: "mongodb://localhost:27017/ott_platform",
        NEXTAUTH_SECRET: "super-secret",
      });
    }).toThrow("NEXTAUTH_URL must be origin-only without path, query, or hash.");
  });

  it("throws when only one Google OAuth variable is set", () => {
    expect(() => {
      getAuthEnvRequired({
        MONGODB_URI: "mongodb://localhost:27017/ott_platform",
        NEXTAUTH_SECRET: "super-secret",
        GOOGLE_CLIENT_ID: "id-123",
      });
    }).toThrow(
      "Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set together in server environment.",
    );
  });

  it("returns undefined MONGODB_URI when not provided", () => {
    const env = getServerEnv({
      NODE_ENV: "development",
    });

    expect(env.MONGODB_URI).toBeUndefined();
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