import type { Context, Next } from "hono";
import { TooManyRequestsError } from "@/lib/errors";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL = 60_000;
const MAX_BUCKETS = 10000;

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  if (buckets.size > MAX_BUCKETS) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyFn?: (c: Context) => string;
}

export function rateLimiter(options: RateLimitOptions) {
  const { windowMs, max } = options;

  return async function rateLimit(c: Context, next: Next) {
    cleanup();

    const key = options.keyFn
      ? options.keyFn(c)
      : c.req.header("X-Forwarded-For") ?? c.req.header("CF-Connecting-IP") ?? "global";

    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count++;
    if (bucket.count > max) {
      throw new TooManyRequestsError();
    }

    return next();
  };
}

export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyFn: (c) => c.req.header("X-Forwarded-For") ?? c.req.header("CF-Connecting-IP") ?? "auth",
});

export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  keyFn: (c) => c.get("userId") ?? c.req.header("X-Forwarded-For") ?? "api",
});
