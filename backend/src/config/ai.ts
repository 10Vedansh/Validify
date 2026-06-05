import { env } from "@/config/env";

export const aiConfig = {
  gemini: {
    apiKey: () => {
      if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
      return env.GEMINI_API_KEY;
    },
    primaryModel: env.GEMINI_MODEL,
    fallbackModel: env.GEMINI_FALLBACK_MODEL,
  },

  openrouter: {
    apiKey: () => {
      if (!env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not set");
      return env.OPENROUTER_API_KEY;
    },
    primaryModel: "openai/gpt-4o-mini",
    fallbackModel: "anthropic/claude-3.5-sonnet",
  },

  request: {
    timeout: 60_000,
    maxRetries: 3,
    retryDelay: 1_000,
    maxConcurrency: 5,
  },
} as const;

export type AiProviderStatus = {
  configured: boolean;
  model: string;
  fallbackModel: string;
  reachable?: boolean | null;
  error?: string | null;
};

export type AiStatus = {
  gemini: AiProviderStatus;
  openrouter: AiProviderStatus;
};

export function getAiStatus(): AiStatus {
  return {
    gemini: {
      configured: !!env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL,
      fallbackModel: env.GEMINI_FALLBACK_MODEL,
    },
    openrouter: {
      configured: !!env.OPENROUTER_API_KEY,
      model: aiConfig.openrouter.primaryModel,
      fallbackModel: aiConfig.openrouter.fallbackModel,
    },
  };
}
