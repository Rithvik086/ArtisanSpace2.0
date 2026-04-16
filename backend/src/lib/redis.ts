import { redisClient } from "../config/redis.ts";

export const Redis = {
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const val = JSON.stringify(value);

    if (ttl) {
      await redisClient.set(key, val, { EX: ttl });
    } else {
      await redisClient.set(key, val);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    const data = await redisClient.get(key);
    return data ? (JSON.parse(data) as T) : null;
  },

  async del(key: string): Promise<void> {
    await redisClient.del(key);
  },

  async exists(key: string): Promise<boolean> {
    const res = await redisClient.exists(key);
    return res === 1;
  },
};
