import logger from "../utils/logger.ts";
import config from "./index.ts";
import { createClient, type RedisClientType } from "redis";

class RedisClient {
  private static instance: RedisClientType;

  static getInstance(): RedisClientType {
    if (!RedisClient.instance) {
      RedisClient.instance = createClient({
        url: config.REDIS_URL || "redis://localhost:6379",
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10)
              return new Error(
                "Unable to connect to Redis after multiple attempts",
              );
            return Math.min(retries * 100, 3000); // Exponential backoff with a max delay of 3 seconds
          },
        },
      });

      RedisClient.instance.on("error", (err) => {
        logger.error({ error: err.message }, "Redis client error");
      });

      RedisClient.instance.on("connect", () => {
        logger.info("Connected to Redis server");
      });
    }

    return RedisClient.instance;
  }
}

export const redisClient = RedisClient.getInstance();
