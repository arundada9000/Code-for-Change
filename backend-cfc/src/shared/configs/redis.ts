import Redis from "ioredis";
import { ENV } from "./env.js";

let redis: Redis;

if (ENV.ENABLE_REDIS && ENV.REDIS_URL) {
  redis = new Redis(ENV.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn("Redis connection failed. Retrying in 1 minute...");
        return 60000;
      }
      return Math.min(times * 100, 3000);
    },
    lazyConnect: true,
  });

  redis.on("connect", () => {
    console.log("Redis connected successfully");
  });

  redis.on("error", (err: any) => {
    if (err.code !== "ECONNREFUSED") {
      console.error("Redis connection error:", err);
    }
  });

  redis.connect().catch(() => {
    console.warn("Failed to connect to Redis. Caching may be disabled.");
  });
} else {
  // Provide a mock or no-op client if Redis is disabled
  // or just let it be undefined and handle it in services.
  // Using a mock to avoid crashes in existing code.
  redis = new Proxy({} as Redis, {
    get: () => () => Promise.resolve(null),
  });
}

export default redis;
