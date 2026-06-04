import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { errorHandler } from "@/middleware/error-handler.middleware";
import { secureHeaders } from "@/middleware/secure-headers.middleware";
import { requestLogger } from "@/middleware/request-logger.middleware";
import { apiRateLimiter } from "@/middleware/rate-limiter.middleware";
import { bodyLimit } from "@/middleware/body-limit.middleware";
import { sanitizeInput } from "@/middleware/sanitize.middleware";
import { authRoutes } from "@/routes/auth.routes";
import { validationRoutes } from "@/routes/validation.routes";
import { reportRoutes } from "@/routes/reports.routes";
import { ideaRoutes } from "@/routes/ideas.routes";
import { chatRoutes } from "@/routes/chat.routes";
import { userRoutes } from "@/routes/user.routes";
import { adminRoutes } from "@/routes/admin.routes";
import { pitchDeckRoutes } from "@/routes/pitch-deck.routes";
import { env } from "@/config/env";

const app = new Hono();

// ─── CORS origins ──────────────────────────────────────────────────────
// Always allow the configured FRONTEND_URL.
// In development, also allow common dev server ports (Vite default 5173,
// explicit frontend port 8081, and the old default 3000).
function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  // Always include the configured origin
  if (env.FRONTEND_URL) {
    origins.add(env.FRONTEND_URL);
  }

  // In development, add common dev server URLs
  if (env.NODE_ENV === "development") {
    origins.add("http://localhost:3000");
    origins.add("http://localhost:5173");
    origins.add("http://localhost:8081");
    origins.add("http://127.0.0.1:3000");
    origins.add("http://127.0.0.1:5173");
    origins.add("http://127.0.0.1:8081");
  }

  return Array.from(origins);
}

const allowedOrigins = getAllowedOrigins();

console.log(`   CORS allowed origins: ${allowedOrigins.join(", ")}`);

// ─── Global Middleware (order matters) ────────────────────────────────
// CORS must come first so preflight OPTIONS succeed and CORS headers
// are set before any security middleware runs.

app.use("*", cors({
  origin: allowedOrigins,
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-Correlation-Id"],
  exposeHeaders: ["X-Correlation-Id"],
  credentials: true,
  maxAge: 86400,
}));

app.use("*", secureHeaders);
app.use("*", bodyLimit);
app.use("*", requestLogger);
app.use("*", apiRateLimiter);

// Input sanitization — stores sanitized body as "sanitizedBody" context var.
// Controllers should prefer sanitizedBody over validated when available.
app.use("*", sanitizeInput);

// Development logging via Hono's built-in logger
if (env.NODE_ENV === "development") {
  app.use("*", logger());
}

app.onError(errorHandler);

// ─── Health Check ─────────────────────────────────────────────────────

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API sub-app (all routes prefixed with /api) ───────────────────────

const api = new Hono();

api.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() }));

api.route("/auth", authRoutes);
api.route("/", validationRoutes);
api.route("/reports", reportRoutes);
api.route("/ideas", ideaRoutes);
api.route("/chat", chatRoutes);
api.route("/", userRoutes);
api.route("/admin", adminRoutes);
api.route("/pitch-decks", pitchDeckRoutes);
app.route("/api", api);

// ─── Start Server (Node.js) ──────────────────────────────────────────

const port = env.PORT;

serve({
  fetch: app.fetch,
  port,
});

console.log(`   Validify API running at http://localhost:${port}`);
console.log(`   Environment: ${env.NODE_ENV}`);

// ─── Cloudflare Workers export ────────────────────────────────────────
// Used only when deployed via wrangler (@cloudflare/vite-plugin).
export default app;
