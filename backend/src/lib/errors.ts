import type { StatusCode } from "hono/utils/http-status";

/**
 * Custom error classes for the application.
 *
 * Every error thrown in service/controller code should be an AppError
 * (or a subclass) so the global error handler can return a normalized
 * JSON response matching the frontend `ApiError` type:
 *
 *   { message: string, status?: number, code?: string, details?: Record<string, unknown> }
 *
 * @see validifyai-main/src/types/api.ts
 */

export class AppError extends Error {
  public readonly statusCode: StatusCode;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: StatusCode,
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: Record<string, unknown>) {
    super(400, "BAD_REQUEST", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You don't have permission to perform this action") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, "NOT_FOUND", `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(409, "CONFLICT", message);
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message = "Upgrade required") {
    super(402, "PAYMENT_REQUIRED", message);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests. Please slow down.") {
    super(429, "RATE_LIMITED", message);
  }
}
