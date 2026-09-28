import type { Response, NextFunction } from "express";
import { redis } from "../lib/redis";
import type { AuthedRequest } from "./require-auth";

/**
 * Sliding-window rate limiter backed by Redis.
 * `bucket` lets each route define its own key/window.
 */
export function rateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number
) {
  return async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const identifier = req.userId ?? req.ip ?? "unknown";
    const key = `rl:${identifier}:${bucket}`;

    try {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSeconds);

      if (count > limit) {
        res.status(429).json({
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Too many requests. Limit: ${limit} per ${windowSeconds}s.`,
          },
        });
        return;
      }
    } catch {
      // Redis unavailable — allow the request rather than blocking all users
    }

    next();
  };
}

/**
 * Free-tier specific: 5 "what next?" queries per rolling calendar day (UTC).
 */
export async function enforceDailyQueryQuota(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (req.userTier !== "free") {
    next();
    return;
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `qcount:${req.userId}:${today}`;

  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60 * 60 * 24);

    if (count > 5) {
      res.status(429).json({
        error: {
          code: "DAILY_QUOTA_EXCEEDED",
          message:
            "You've used all 5 free queries today. Upgrade to Pro for unlimited.",
        },
      });
      return;
    }
  } catch {
    // Redis unavailable — allow through
  }

  next();
}

/**
 * Get remaining queries for the day (for usage display).
 */
export async function getDailyQueryCount(userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `qcount:${userId}:${today}`;
  try {
    const count = await redis.get(key);
    return count ? parseInt(count, 10) : 0;
  } catch {
    return 0;
  }
}
