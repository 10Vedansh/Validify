import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/jwt";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { authConfig } from "@/config/auth";
import crypto from "node:crypto";

import type {
  AuthSessionResponse,
  UserResponse,
} from "@/types/auth";
import type { LoginInput, RegisterInput } from "@/schemas/auth.schema";
import type { Plan } from "@prisma/client";

/**
 * Auth service.
 *
 * All public methods return plain objects (not Prisma models) so the
 * controller never leaks database internals to the API response.
 */

// ─── Helpers ──────────────────────────────────────────────────────────

function prismaPlanToResponse(plan: Plan): "free" | "pro" | "enterprise" {
  switch (plan) {
    case "FREE":       return "free";
    case "PRO":        return "pro";
    case "ENTERPRISE": return "enterprise";
  }
}

function toUserResponse(user: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  plan: Plan;
  createdAt: Date;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    isAdmin: user.isAdmin,
    plan: prismaPlanToResponse(user.plan),
    createdAt: user.createdAt.toISOString(),
  };
}

async function createSession(user: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  plan: Plan;
  createdAt: Date;
  tokenVersion: number;
}): Promise<AuthSessionResponse> {
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    plan: user.plan,
    isAdmin: user.isAdmin,
    tokenVersion: user.tokenVersion,
  });

  const refreshToken = await signRefreshToken({
    sub: user.id,
    tokenVersion: user.tokenVersion,
  });

  const { decodeJwt } = await import("jose");
  const decoded = decodeJwt(accessToken);
  const expiresAt = decoded.exp ? decoded.exp * 1000 : undefined;

  return {
    user: toUserResponse(user),
    token: accessToken,
    refreshToken,
    expiresAt,
  };
}

// ─── Public API ───────────────────────────────────────────────────────

export const authService = {
  /**
   * Register a new user.
   *
   * POST /auth/register
   * Request:  { name, email, password }
   * Response: AuthSessionResponse { user, token, refreshToken, expiresAt }
   *
   * Throws ConflictError if the email is already taken.
   */
  async register(input: RegisterInput): Promise<AuthSessionResponse> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        name: input.name.trim(),
        passwordHash,
      },
    });

    return createSession(user);
  },

  /**
   * Authenticate an existing user.
   *
   * POST /auth/login
   * Request:  { email, password }
   * Response: AuthSessionResponse { user, token, refreshToken, expiresAt }
   *
   * Throws UnauthorizedError if credentials are invalid,
   * or NotFoundError if the account was soft-deleted.
   */
  async login(input: LoginInput): Promise<AuthSessionResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.deletedAt) {
      throw new NotFoundError("Account");
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return createSession(user);
  },

  /**
   * Issue a new access token using a valid refresh token.
   *
   * POST /auth/refresh
   * Request:  { refreshToken }
   * Response: AuthSessionResponse { user, token, refreshToken, expiresAt }
   *
   * Throws UnauthorizedError if the refresh token is invalid or expired,
   * or if the user's tokenVersion has changed (forced logout).
   */
  async refresh(refreshToken: string): Promise<AuthSessionResponse> {
    let payload: { sub: string; tokenVersion: number };
    try {
      payload = await verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedError("User not found");
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedError("Refresh token has been invalidated");
    }

    return createSession(user);
  },

  /**
   * Log out by incrementing the user's token version.
   * This invalidates all existing refresh tokens for that user.
   *
   * POST /auth/logout
   * Auth: required
   * Response: void
   */
  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  },

  /**
   * Get the currently authenticated user's profile.
   *
   * GET /auth/me
   * Auth: required
   * Response: UserResponse
   */
  async me(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundError("User");
    }

    return toUserResponse(user);
  },

  /**
   * Initiate a password reset.
   *
   * Generates a secure random token, stores its SHA-256 hash on the user
   * record with a 1-hour expiry, and (in production) sends an email.
   *
   * POST /auth/forgot-password
   * Request:  { email }
   * Response: void (always succeeds to prevent email enumeration)
   */
  async requestPasswordReset(email: string): Promise<void> {
    // Always return silently to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.deletedAt) {
      return;
    }

    const rawToken = crypto.randomBytes(authConfig.passwordReset.tokenLength).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiresAt: new Date(Date.now() + authConfig.passwordReset.expiresInMs),
      },
    });

    // TODO: Send email via Resend/SendGrid
    // await emailService.sendPasswordReset(user.email, rawToken);
  },

  /**
   * Complete a password reset.
   *
   * Verifies the reset token (hashed comparison), then updates the password
   * and increments tokenVersion to invalidate all sessions.
   *
   * POST /auth/reset-password
   * Request:  { token, password }
   * Response: void
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiresAt: { gt: new Date() },
        deletedAt: null,
      },
    });

    if (!user) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
        tokenVersion: { increment: 1 }, // invalidate all sessions
      },
    });
  },
};
