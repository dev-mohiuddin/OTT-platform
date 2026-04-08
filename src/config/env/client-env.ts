import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().optional(),
  NEXT_PUBLIC_DEFAULT_COUNTRY_CODE: z.string().length(2).default("BD"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default("bn-BD"),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().length(3).default("BDT"),
  NEXT_PUBLIC_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function getClientEnv(env: Record<string, string | undefined> = process.env): ClientEnv {
  return clientEnvSchema.parse(env);
}