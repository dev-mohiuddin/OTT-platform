import { getRedisClient } from "@/lib/redis/client";

export async function redisGet(key: string): Promise<string | null> {
  const client = await getRedisClient();
  if (!client) {
    return null;
  }

  return client.get(key);
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> {
  const client = await getRedisClient();
  if (!client) {
    return;
  }

  if (ttlSeconds && ttlSeconds > 0) {
    await client.set(key, value, {
      EX: ttlSeconds,
    });
    return;
  }

  await client.set(key, value);
}

export async function redisDelete(key: string): Promise<void> {
  const client = await getRedisClient();
  if (!client) {
    return;
  }

  await client.del(key);
}

export async function redisIncrementWithExpiry(
  key: string,
  ttlSeconds: number,
): Promise<number | null> {
  const client = await getRedisClient();
  if (!client) {
    return null;
  }

  const count = await client.incr(key);

  if (count === 1 && ttlSeconds > 0) {
    await client.expire(key, ttlSeconds);
  }

  return count;
}

export async function redisGetJson<T>(key: string): Promise<T | null> {
  const rawValue = await redisGet(key);
  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as T;
}

export async function redisSetJson(
  key: string,
  value: unknown,
  ttlSeconds?: number,
): Promise<void> {
  await redisSet(key, JSON.stringify(value), ttlSeconds);
}
