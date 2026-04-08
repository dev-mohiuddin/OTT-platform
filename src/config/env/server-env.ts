import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
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