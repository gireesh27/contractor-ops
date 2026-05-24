import Redis from "ioredis";
import { env } from "@/lib/env";

let redis: Redis | null = null;
let warned = false;

function getRedis() {
  if (!env.redisUrl) {
    if (!warned) {
      console.warn("REDIS_URL not configured. Running without cache.");
      warned = true;
    }
    return null;
  }

  if (!redis) {
    redis = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true
    });
  }

  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 120) {
  const client = getRedis();
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Cache failures should never block site work.
  }
}

export async function cacheDel(pattern: string) {
  const client = getRedis();
  if (!client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(...keys);
  } catch {
    // no-op
  }
}

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const client = getRedis();
  if (!client) return { allowed: true, remaining: limit };
  const count = await client.incr(key);
  if (count === 1) await client.expire(key, windowSeconds);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}
