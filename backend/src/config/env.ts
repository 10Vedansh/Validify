import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8080),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  // Database
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32).default("dev-access-secret-min-32-chars-long!!"),
  JWT_REFRESH_SECRET: z.string().min(32).default("dev-refresh-secret-min-32-chars-long!"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  // Gemini
  GEMINI_API_KEY: z.string().default(""),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
  GEMINI_FALLBACK_MODEL: z.string().default("gemini-2.0-flash-lite"),

  // OpenRouter
  OPENROUTER_API_KEY: z.string().default(""),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(" Invalid environment variables:");
    for (const [key, errors] of Object.entries(parsed.error.flatten().fieldErrors)) {
      console.error(`   ${key}: ${errors?.join(", ")}`);
    }
    process.exit(1);
  }

  const env = parsed.data;

  // ─── AI provider startup validation ──────────────────────────────
  console.log("");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║       AI Provider Configuration                  ║");
  console.log("╚══════════════════════════════════════════════════╝");

  if (env.GEMINI_API_KEY) {
    console.log(`  ✓ GEMINI_API_KEY       present (${env.GEMINI_API_KEY.substring(0, 8)}...${env.GEMINI_API_KEY.slice(-4)})`);
  } else {
    console.log(`  ✗ GEMINI_API_KEY       NOT SET — Gemini provider disabled`);
  }
  console.log(`  ✓ GEMINI_MODEL         ${env.GEMINI_MODEL}`);
  console.log(`  ✓ GEMINI_FALLBACK_MODEL ${env.GEMINI_FALLBACK_MODEL}`);

  if (env.OPENROUTER_API_KEY) {
    console.log(`  ✓ OPENROUTER_API_KEY   present (${env.OPENROUTER_API_KEY.substring(0, 8)}...${env.OPENROUTER_API_KEY.slice(-4)})`);
  } else {
    console.log(`  ✗ OPENROUTER_API_KEY   NOT SET — OpenRouter fallback disabled`);
  }
  console.log("─────────────────────────────────────────────────────────");

  if (!env.GEMINI_API_KEY && !env.OPENROUTER_API_KEY) {
    console.log("  WARNING: No AI provider configured.");
    console.log("  AI chat and validation features will return errors.");
    console.log("  To fix: set GEMINI_API_KEY or OPENROUTER_API_KEY");
    console.log("  in your Render environment variables.");
    console.log("  Get a Gemini key: https://aistudio.google.com/app/apikey");
    console.log("  Get an OpenRouter key: https://openrouter.ai/keys");
  } else if (!env.GEMINI_API_KEY) {
    console.log("  Note: Only OpenRouter is configured (set as fallback).");
  } else if (!env.OPENROUTER_API_KEY) {
    console.log("  Note: Only Gemini is configured (no OpenRouter fallback).");
  } else {
    console.log("  Both Gemini and OpenRouter are configured.");
  }
  console.log("─────────────────────────────────────────────────────────");
  console.log("");

  // Warn about dev JWT secrets in production
  if (env.NODE_ENV === "production") {
    if (env.JWT_ACCESS_SECRET.length < 48 || env.JWT_REFRESH_SECRET.length < 48) {
      console.warn("   WARNING: Using weak/default JWT secrets in production.");
    }
  }

  return env;
}

export const env = loadEnv();
export type Env = z.infer<typeof envSchema>;
