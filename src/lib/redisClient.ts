import { Redis } from "@upstash/redis";

let redisInstance: Redis | null = null;

export function getRedisClient(): Redis {
  if (redisInstance) return redisInstance;

  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;

  if (!url || !token) {
    console.warn("⚠️ UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN is missing. Returning a lightweight mock proxy.");
    // Return mock Redis to avoid system boot crashes
    const mockStorage = new Map<string, any>();
    return {
      get: async (key: string) => mockStorage.get(key) || null,
      set: async (key: string, value: any) => {
        mockStorage.set(key, value);
        return "OK";
      },
      del: async (key: string) => {
        const existed = mockStorage.has(key);
        mockStorage.delete(key);
        return existed ? 1 : 0;
      },
    } as unknown as Redis;
  }

  redisInstance = new Redis({
    url,
    token,
  });

  return redisInstance;
}
