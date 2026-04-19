import { redisClient } from "../config/redis.ts";

export const Redis = {
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!redisClient.isOpen) {
      return;
    }

    const val = JSON.stringify(value);

    if (ttl) {
      await redisClient.set(key, val, { EX: ttl });
    } else {
      await redisClient.set(key, val);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    if (!redisClient.isOpen) {
      return null;
    }

    const data = await redisClient.get(key);
    if (!data) {
      return null;
    }

    try {
      const parsed = JSON.parse(data) as unknown;

      // Backward compatibility for previously double-stringified payloads.
      if (typeof parsed === "string") {
        try {
          return JSON.parse(parsed) as T;
        } catch {
          return parsed as T;
        }
      }

      return parsed as T;
    } catch {
      return data as T;
    }
  },

  async del(key: string): Promise<void> {
    if (!redisClient.isOpen) {
      return;
    }

    await redisClient.del(key);
  },

  async exists(key: string): Promise<boolean> {
    if (!redisClient.isOpen) {
      return false;
    }

    const res = await redisClient.exists(key);
    return res === 1;
  },

  async delByPrefix(prefix: string): Promise<void> {
    if (!redisClient.isOpen) {
      return;
    }

    let cursor = "0";

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: `${prefix}*`,
        COUNT: 100,
      });

      cursor = result.cursor;
      if (result.keys.length > 0) {
        await redisClient.del(result.keys);
      }
    } while (cursor !== "0");
  },

  async getOrSet<T>(
    key: string,
    resolver: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    if (!redisClient.isOpen) {
      return resolver();
    }

    try {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      const fresh = await resolver();
      await this.set(key, fresh, ttl);
      return fresh;
    } catch {
      return resolver();
    }
  },
};
