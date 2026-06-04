import type { Context, Next } from "hono";

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /on\w+\s*=\s*"[^"]*"/gi,
  /on\w+\s*=\s*'[^']*'/gi,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /vbscript\s*:/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
];

export function stripXSS(value: unknown): unknown {
  if (typeof value === "string") {
    let cleaned = value;
    for (const pattern of XSS_PATTERNS) {
      cleaned = cleaned.replace(pattern, "");
    }
    return cleaned.trim();
  }
  if (Array.isArray(value)) {
    return value.map(stripXSS);
  }
  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      sanitized[key] = stripXSS(val);
    }
    return sanitized;
  }
  return value;
}

let sanitizeEnabled = true;

export function disableSanitize() {
  sanitizeEnabled = false;
}

export async function sanitizeInput(c: Context, next: Next) {
  if (!sanitizeEnabled) return next();

  const contentType = c.req.header("Content-Type") ?? "";
  if (!contentType.includes("application/json")) return next();

  // Clone the original body, sanitize it, store for downstream consumption.
  // Controllers and services should use c.get("sanitizedBody") when available.
  const rawBody = await c.req.raw.clone().json().catch(() => null);
  if (!rawBody) return next();

  const sanitized = stripXSS(rawBody) as Record<string, unknown>;
  c.set("sanitizedBody", sanitized);

  await next();
}

// Type augmentation so c.get("sanitizedBody") is typed
declare module "hono" {
  interface ContextVariableMap {
    sanitizedBody: Record<string, unknown>;
  }
}
