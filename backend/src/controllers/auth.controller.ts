import type { Context } from "hono";
import { authService } from "@/services/auth.service";
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  RefreshTokenInput,
} from "@/schemas/auth.schema";

/**
 * Auth controller.
 *
 * Thin layer between routes and the auth service.
 * Each handler extracts validated data from the context (set by
 * the Zod validation middleware), calls the service, and returns
 * a JSON response.
 */

export const authController = {
  async register(c: Context) {
    const body = c.req.valid("json" as never) as RegisterInput;
    const session = await authService.register(body);
    return c.json(session, 201);
  },

  async login(c: Context) {
    const body = c.req.valid("json" as never) as LoginInput;
    const session = await authService.login(body);
    return c.json(session);
  },

  async refresh(c: Context) {
    const body = c.req.valid("json" as never) as RefreshTokenInput;
    const session = await authService.refresh(body.refreshToken);
    return c.json(session);
  },

  async logout(c: Context) {
    const userId = c.get("userId");
    await authService.logout(userId);
    return c.json({ message: "Logged out successfully" });
  },

  async me(c: Context) {
    const userId = c.get("userId");
    const user = await authService.me(userId);
    return c.json(user);
  },

  async forgotPassword(c: Context) {
    const body = c.req.valid("json" as never) as ForgotPasswordInput;
    await authService.requestPasswordReset(body.email);
    return c.json({ message: "If the email exists, a reset link has been sent." });
  },

  async resetPassword(c: Context) {
    const body = c.req.valid("json" as never) as ResetPasswordInput;
    await authService.resetPassword(body.token, body.password);
    return c.json({ message: "Password has been reset successfully." });
  },
};
