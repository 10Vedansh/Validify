import type { Context, Next } from "hono";
import { ForbiddenError } from "@/lib/errors";

export async function requireAdmin(c: Context, next: Next) {
  if (!c.get("isAdmin")) {
    throw new ForbiddenError("Admin access required");
  }
  await next();
}
