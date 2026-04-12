import { createClient } from "redis";

import { getServerEnv } from "@/config/env/server-env";
import { serverLogger } from "@/server/common/logging/server-logger";

type RedisClient = ReturnType<typeof createClient>;
type RedisConnection = RedisClient | null;

const globalForRedis = globalThis as unknown as {
  redis?: RedisConnection;
};

function createRedisConnection(): RedisConnection {
  const env = getServerEnv(process.env);

  if (!env.REDIS_ENABLED || !env.REDIS_URL) {
    return null;
  }

  const client = createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy(retries: number) {
        return Math.min(retries * 100, 3_000);
      },
    },
  });

  client.on("error", (error: unknown) => {
    serverLogger.warn("Redis client error", { error });
  });

  return client;
}

export const redisClient = globalForRedis.redis ?? createRedisConnection();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redisClient;
}

export async function getRedisClient(): Promise<RedisClient | null> {
  if (!redisClient) {
    return null;
  }

  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
    } catch (error) {
      serverLogger.warn("Failed to connect Redis client", {
        error,
      });

      return null;
    }
  }

  return redisClient;
}

export function isRedisEnabled(): boolean {
  return Boolean(redisClient);
}
