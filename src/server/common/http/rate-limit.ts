import { getServerEnv } from "@/config/env/server-env";
import { redisIncrementWithExpiry } from "@/lib/redis/kv";
import { AppError } from "@/server/common/errors/app-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";
import type { RequestContext } from "@/server/common/context/request-context";

function resolveRateLimitIdentity(context: RequestContext): string {
  if (context.ipAddress && context.ipAddress.trim().length > 0) {
    return context.ipAddress;
  }

  return context.requestId;
}

export async function enforceRateLimit(context: RequestContext): Promise<void> {
  const env = getServerEnv(process.env);
  if (!env.REDIS_ENABLED) {
    return;
  }

  const windowSeconds = env.API_RATE_LIMIT_WINDOW_SECONDS;
  const maxRequests = env.API_RATE_LIMIT_MAX_REQUESTS;
  const bucket = Math.floor(Date.now() / (windowSeconds * 1_000));
  const identity = resolveRateLimitIdentity(context);
  const key = `rate:api:${context.method}:${context.path}:${identity}:${bucket}`;

  const total = await redisIncrementWithExpiry(key, windowSeconds);
  if (!total) {
    return;
  }

  if (total > maxRequests) {
    throw new AppError("Too many requests. Please try again later.", {
      code: API_ERROR_CODES.RATE_LIMITED,
      expose: true,
      details: {
        retryAfterSeconds: windowSeconds,
      },
    });
  }
}
