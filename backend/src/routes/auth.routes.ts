import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authController } from "@/controllers/auth.controller";
import { requireAuth } from "@/middleware/auth.middleware";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from "@/schemas/auth.schema";

/**
 * Auth routes.
 *
 * All routes are prefixed with /auth in the app entry (src/index.ts).
 *
 * Endpoints:
 *
 *   POST /auth/register       — Create account
 *   POST /auth/login          — Sign in
 *   POST /auth/refresh        — Refresh access token
 *   POST /auth/logout         — Sign out (requires auth)
 *   GET  /auth/me             — Get current user (requires auth)
 *   POST /auth/forgot-password — Send reset email
 *   POST /auth/reset-password  — Complete password reset
 *
 * Compatible with frontend service at validifyai-main/src/services/auth.service.ts
 */

const router = new Hono();

// ─── Public routes ────────────────────────────────────────────────────

router.post("/register", zValidator("json", registerSchema), authController.register);

router.post("/login", zValidator("json", loginSchema), authController.login);

router.post("/refresh", zValidator("json", refreshTokenSchema), authController.refresh);

router.post("/forgot-password", zValidator("json", forgotPasswordSchema), authController.forgotPassword);

router.post("/reset-password", zValidator("json", resetPasswordSchema), authController.resetPassword);

// ─── Protected routes ─────────────────────────────────────────────────

router.post("/logout", requireAuth, authController.logout);

router.get("/me", requireAuth, authController.me);

export { router as authRoutes };
