import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1).optional(),
  MONGODB_DB_NAME: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).optional(),
  REDIS_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  REDIS_TTL_ACCESS_SNAPSHOT_SECONDS: z.coerce.number().int().positive().default(600),
  REDIS_TTL_AUTH_ATTEMPT_SECONDS: z.coerce.number().int().positive().default(900),
  API_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
  API_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(120),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  AUTH_TRUST_HOST: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      return value === "true";
    }),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      return value === "true";
    }),
  SMTP_HOST: z.string().min(1).default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  SMTP_FROM: z.string().email().optional(),
  AUTH_CODE_EXPIRY_MINUTES: z.coerce.number().int().positive().default(10),
  PASSWORD_RESET_CODE_EXPIRY_MINUTES: z.coerce.number().int().positive().default(15),
  SUPER_ADMIN_EMAIL: z.string().email().default("admin@admin.com"),
  SUPER_ADMIN_PASSWORD: z.string().min(8).default("12345678"),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  BKASH_BASE_URL: z.string().url().optional(),
  NAGAD_BASE_URL: z.string().url().optional(),
  DEFAULT_COUNTRY_CODE: z.string().length(2).default("BD"),
  DEFAULT_LOCALE: z.string().default("bn-BD"),
  DEFAULT_CURRENCY: z.string().length(3).default("BDT"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(env: Record<string, string | undefined> = process.env): ServerEnv {
  return serverEnvSchema.parse(env);
}

function isMongoConnectionString(value: string): boolean {
  return value.startsWith("mongodb://") || value.startsWith("mongodb+srv://");
}

function validateNextAuthUrl(parsed: ServerEnv): void {
  if (!parsed.NEXTAUTH_URL) {
    if (parsed.NODE_ENV === "production") {
      throw new Error("Missing NEXTAUTH_URL in server environment.");
    }

    return;
  }

  const nextAuthUrl = new URL(parsed.NEXTAUTH_URL);

  if (parsed.NODE_ENV === "production" && nextAuthUrl.protocol !== "https:") {
    throw new Error("NEXTAUTH_URL must use https in production environment.");
  }

  if (nextAuthUrl.pathname !== "/" || nextAuthUrl.search || nextAuthUrl.hash) {
    throw new Error("NEXTAUTH_URL must be origin-only without path, query, or hash.");
  }
}

export function getServerEnvRequired(
  env: Record<string, string | undefined> = process.env,
): Required<Pick<ServerEnv, "MONGODB_URI" | "NEXTAUTH_SECRET" | "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET" | "SMTP_USER" | "SMTP_PASS" | "SMTP_FROM">> & ServerEnv {
  const parsed = getServerEnv(env);

  if (!parsed.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in server environment.");
  }

  if (!parsed.NEXTAUTH_SECRET) {
    throw new Error("Missing NEXTAUTH_SECRET in server environment.");
  }

  if (!parsed.GOOGLE_CLIENT_ID || !parsed.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google OAuth credentials in server environment.");
  }

  if (!parsed.SMTP_USER || !parsed.SMTP_PASS || !parsed.SMTP_FROM) {
    throw new Error("Missing SMTP_USER, SMTP_PASS, or SMTP_FROM in server environment.");
  }

  return parsed as Required<Pick<ServerEnv, "MONGODB_URI" | "NEXTAUTH_SECRET" | "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET" | "SMTP_USER" | "SMTP_PASS" | "SMTP_FROM">> & ServerEnv;
}

export function getAuthEnvRequired(
  env: Record<string, string | undefined> = process.env,
): Required<Pick<ServerEnv, "MONGODB_URI" | "NEXTAUTH_SECRET">> & ServerEnv {
  const parsed = getServerEnv(env);
  validateNextAuthUrl(parsed);

  if (!parsed.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in server environment.");
  }

  if (!isMongoConnectionString(parsed.MONGODB_URI)) {
    throw new Error("Invalid MONGODB_URI. It must start with mongodb:// or mongodb+srv://.");
  }

  if (!parsed.NEXTAUTH_SECRET) {
    throw new Error("Missing NEXTAUTH_SECRET in server environment.");
  }

  const hasGoogleClientId = Boolean(parsed.GOOGLE_CLIENT_ID);
  const hasGoogleClientSecret = Boolean(parsed.GOOGLE_CLIENT_SECRET);

  if (hasGoogleClientId !== hasGoogleClientSecret) {
    throw new Error("Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set together in server environment.");
  }

  return parsed as Required<Pick<ServerEnv, "MONGODB_URI" | "NEXTAUTH_SECRET">> & ServerEnv;
}

export function getSmtpEnvRequired(
  env: Record<string, string | undefined> = process.env,
): Required<Pick<ServerEnv, "SMTP_USER" | "SMTP_PASS" | "SMTP_FROM">> & ServerEnv {
  const parsed = getServerEnv(env);

  if (!parsed.SMTP_USER || !parsed.SMTP_PASS || !parsed.SMTP_FROM) {
    throw new Error("Missing SMTP_USER, SMTP_PASS, or SMTP_FROM in server environment.");
  }

  return parsed as Required<Pick<ServerEnv, "SMTP_USER" | "SMTP_PASS" | "SMTP_FROM">> & ServerEnv;
}