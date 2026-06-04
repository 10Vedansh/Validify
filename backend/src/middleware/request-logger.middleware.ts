import type { Context, Next } from "hono";
import pino from "pino";
import crypto from "node:crypto";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  serializers: {
    req: (r: Record<string, unknown>) => ({ method: r.method, url: r.url, userId: r.userId }),
    res: (r: Record<string, unknown>) => ({ statusCode: r.statusCode }),
  },
});

export async function requestLogger(c: Context, next: Next) {
  const correlationId = crypto.randomUUID();
  const start = performance.now();

  c.set("correlationId", correlationId);
  c.res.headers.set("X-Correlation-Id", correlationId);

  await next();

  const duration = performance.now() - start;
  const userId = c.get("userId");
  const statusCode = c.res.status;

  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

  logger[level]({
    correlationId,
    method: c.req.method,
    path: c.req.path,
    statusCode,
    durationMs: Math.round(duration),
    userId,
    query: c.req.query(),
  });
}

declare module "hono" {
  interface ContextVariableMap {
    correlationId: string;
  }
}
