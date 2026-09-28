import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new IORedis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  lazyConnect: true,
});

// Separate connection for BullMQ (needs different options)
export const redisConnection = {
  host: new URL(redisUrl).hostname,
  port: Number(new URL(redisUrl).port) || 6379,
  password: new URL(redisUrl).password || undefined,
  tls: redisUrl.startsWith("rediss://") ? {} : undefined,
};

redis.on("error", (err) => {
  // Don't crash on redis connection errors — gracefully degrade
  console.error("[redis] connection error:", err.message);
});
