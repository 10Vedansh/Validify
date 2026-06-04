import type { Context, Next } from "hono";
import { verifyAccessToken } from "@/lib/jwt";
import { UnauthorizedError } from "@/lib/errors";

/**
 * augments Hono's Context with auth user info.
 */
declare module "hono" {
  interface ContextVariableMap {
    userId: string;
    userEmail: string;
    userPlan: string;
    isAdmin: boolean;
    tokenVersion: number;
  }
}

/**
 * Authentication middleware.
 *
 * Extracts and verifies the Bearer token from the Authorization header.
 * On success, sets `userId`, `userEmail`, `userPlan`, and `tokenVersion`
 * on the Hono context for downstream handlers.
 *
 * Compatible with the frontend Axios interceptor which sends:
 *   Authorization: Bearer <token>
 *
 * On failure, throws an UnauthorizedError which the global error handler
 * converts to a 401 JSON response matching the frontend `ApiError` type.
 * The frontend's interceptor catches 401 responses and clears the auth store.
 */

export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header("Authorization");
  if (!header) {
    throw new UnauthorizedError("Authentication required");
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Invalid authorization header format");
  }

  try {
    const payload = await verifyAccessToken(token);

    c.set("userId", payload.sub);
    c.set("userEmail", payload.email);
    c.set("userPlan", payload.plan);
    c.set("isAdmin", payload.isAdmin);
    c.set("tokenVersion", payload.tokenVersion);
  } catch (error) {
    // `jose` throws with `code: "ERR_JWT_EXPIRED"` or `code: "ERR_JWT_INVALID"`
    if ((error as { code?: string })?.code === "ERR_JWT_EXPIRED") {
      throw new UnauthorizedError("Token expired");
    }
    throw new UnauthorizedError("Invalid token");
  }

  await next();
}

/**
 * Optional auth middleware — attaches user info if a valid token
 * is present, but does not block the request if absent.
 */
export async function optionalAuth(c: Context, next: Next) {
  const header = c.req.header("Authorization");
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7);
    try {
      const payload = await verifyAccessToken(token);
      c.set("userId", payload.sub);
      c.set("userEmail", payload.email);
      c.set("userPlan", payload.plan);
      c.set("isAdmin", payload.isAdmin);
      c.set("tokenVersion", payload.tokenVersion);
    } catch {
      // Silently ignore invalid tokens for optional auth
    }
  }
  await next();
}
