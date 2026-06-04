import type { Context } from "hono";
import { AppError } from "@/lib/errors";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export function errorHandler(error: Error, c: Context) {
  const correlationId = c.get("correlationId") ?? "unknown";

  // ─── Application errors ──────────────────────────────────────────
  if (error instanceof AppError) {
    logger.warn({ correlationId, code: error.code, statusCode: error.statusCode }, error.message);
    return c.json(
      {
        message: error.message,
        status: error.statusCode,
        code: error.code,
        details: error.details,
      },
      error.statusCode as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500,
    );
  }

  // ─── Prisma known-request errors ─────────────────────────────────
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn({ correlationId, prismaCode: error.code }, error.message);
    switch (error.code) {
      case "P2002": {
        const target = (error.meta?.target as string[] | undefined)?.join(", ") ?? "field";
        return c.json(
          { message: `A record with that ${target} already exists`, status: 409, code: "CONFLICT" },
          409,
        );
      }
      case "P2025": {
        return c.json(
          { message: "Resource not found", status: 404, code: "NOT_FOUND" },
          404,
        );
      }
      case "P2003": {
        return c.json(
          { message: "Referenced record does not exist", status: 400, code: "FOREIGN_KEY_ERROR" },
          400,
        );
      }
      default: {
        return c.json(
          { message: "Database error", status: 500, code: "DB_ERROR" },
          500,
        );
      }
    }
  }

  // ─── Prisma validation errors ────────────────────────────────────
  if (error instanceof Prisma.PrismaClientValidationError) {
    logger.warn({ correlationId }, "Prisma validation error");
    return c.json(
      { message: "Invalid data provided", status: 400, code: "VALIDATION_ERROR" },
      400,
    );
  }

  // ─── Zod validation errors ────────────────────────────────────────
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".");
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    }
    logger.warn({ correlationId, details }, "Validation error");
    return c.json(
      {
        message: "Validation failed",
        status: 400,
        code: "VALIDATION_ERROR",
        details,
      },
      400,
    );
  }

  // ─── Fetch errors (network failures) ──────────────────────────────
  if (error instanceof TypeError && error.message === "fetch failed") {
    logger.error({ correlationId }, "External service unreachable");
    return c.json(
      {
        message: "External service unreachable. Please try again later.",
        status: 502,
        code: "BAD_GATEWAY",
      },
      502,
    );
  }

  // ─── JWT errors ──────────────────────────────────────────────────
  if (error.name === "JWTExpired" || (error as { code?: string })?.code === "ERR_JWT_EXPIRED") {
    logger.warn({ correlationId }, "Token expired");
    return c.json(
      { message: "Token expired", status: 401, code: "TOKEN_EXPIRED" },
      401,
    );
  }

  if (error.name === "JWTInvalid" || (error as { code?: string })?.code === "ERR_JWT_INVALID") {
    logger.warn({ correlationId }, "Invalid token");
    return c.json(
      { message: "Invalid token", status: 401, code: "TOKEN_INVALID" },
      401,
    );
  }

  // ─── Unhandled errors — don't leak internals ─────────────────────
  logger.error({ correlationId, err: error }, "Unhandled error");
  return c.json(
    {
      message: "Something went wrong. Please try again.",
      status: 500,
      code: "INTERNAL_ERROR",
    },
    500,
  );
}
