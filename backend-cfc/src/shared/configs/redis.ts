// src/shared/configs/redis.ts
import Redis from "ioredis";
import { ENV } from "./env.js";

// Minimal Redis interface for type safety
interface RedisClient {
  setex(key: string, ttl: number, value: string): Promise<"OK" | null>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
  on(event: "connect" | "error", listener: (...args: any[]) => void): void;
  connect(): Promise<void>;
}

let redis: RedisClient;

if (ENV.ENABLE_REDIS && ENV.REDIS_URL) {
  const realRedis = new Redis(ENV.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) =>
      times > 3 ? 60000 : Math.min(times * 100, 3000),
    lazyConnect: true,
  });

  redis = {
    setex: (...args) => realRedis.setex(...args),
    get: (...args) => realRedis.get(...args),
    del: (...args) => realRedis.del(...args),
    on: (...args) => realRedis.on(...args),
    connect: () => realRedis.connect(),
  };

  redis.on("connect", () => console.log("Redis connected successfully"));
  redis.on("error", (err) => {
    if (err.code !== "ECONNREFUSED") console.error("Redis error:", err);
  });

  redis.connect().catch(() => {
    console.warn("Failed to connect to Redis. Caching may be disabled.");
  });
} else {
  // Mock Redis that is fully compatible
  redis = {
    setex: async () => "OK",
    get: async () => null,
    del: async () => 0,
    on: () => {}, // noop
    connect: async () => {},
  };
}

export default redis;

/*import Redis from "ioredis";
import { ENV } from "./env.js";

let redis: Redis | null = null;

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

*/
