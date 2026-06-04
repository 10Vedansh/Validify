import { env } from "@/config/env";

export const aiConfig = {
  gemini: {
    apiKey: () => {
      if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set. Add GEMINI_API_KEY to your .env file.");
      return env.GEMINI_API_KEY;
    },
    primaryModel: env.GEMINI_MODEL,
    fallbackModel: env.GEMINI_FALLBACK_MODEL,
  },

  request: {
    timeout: 60_000,
    maxRetries: 3,
    retryDelay: 1_000,
    maxConcurrency: 5,
  },
} as const;
