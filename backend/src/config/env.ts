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

  // Warn about dev JWT secrets in production
  if (env.NODE_ENV === "production") {
    if (env.JWT_ACCESS_SECRET.length < 48 || env.JWT_REFRESH_SECRET.length < 48) {
      console.warn("   WARNING: Using weak/default JWT secrets in production. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to strong random values (64+ chars).");
    }
    if (!env.GEMINI_API_KEY) {
      console.warn("   WARNING: GEMINI_API_KEY is not set. AI validation features will fail.");
    }
  }

  return env;
}

export const env = loadEnv();
export type Env = z.infer<typeof envSchema>;
