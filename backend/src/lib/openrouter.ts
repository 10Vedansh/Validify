import { aiConfig } from "@/config/ai";

// ⚠ DEPRECATED — use @/lib/gemini instead

/**
 * OpenRouter API client.
 *
 * Features:
 *   - Automatic retries with exponential backoff
 *   - Configurable timeout per request
 *   - Fallback model if primary fails
 *   - JSON-only mode for structured parsing
 *   - Token usage tracking
 */

// ─── Types ────────────────────────────────────────────────────────────

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: { content: string };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface OpenRouterError {
  error: {
    message: string;
    code?: string;
    metadata?: Record<string, unknown>;
  };
}

// ─── Retry logic ──────────────────────────────────────────────────────

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  timeout: number;
}

async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {
    maxRetries: aiConfig.request.maxRetries,
    baseDelay: aiConfig.request.retryDelay,
    timeout: aiConfig.request.timeout,
  },
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout);

      try {
        const result = await fn(attempt);
        return result;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on 4xx errors (except 429 rate limit)
      if (error instanceof HttpError && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
        throw error;
      }

      if (attempt < options.maxRetries) {
        const delay = options.baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
        console.warn(`[OpenRouter] Attempt ${attempt} failed: ${lastError.message}. Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error("All retry attempts exhausted");
}

// ─── HTTP error ───────────────────────────────────────────────────────

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public body?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

// ─── Core completion function ─────────────────────────────────────────

async function executeCompletion(
  request: OpenRouterRequest,
  signal?: AbortSignal,
): Promise<OpenRouterResponse> {
  const response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://validify.app",
      "X-Title": "Validify",
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    let errorBody: string | undefined;
    try {
      const errorJson = (await response.json()) as OpenRouterError;
      errorBody = errorJson.error?.message ?? response.statusText;
    } catch {
      errorBody = response.statusText;
    }
    throw new HttpError(response.status, errorBody ?? "OpenRouter request failed");
  }

  return response.json() as Promise<OpenRouterResponse>;
}

// ─── Public API ───────────────────────────────────────────────────────

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Send a completion request to OpenRouter with retry and timeout.
 *
 * If the primary model fails with a server error, it automatically
 * falls back to the configured fallback model.
 */
export async function complete(
  messages: OpenRouterMessage[],
  options: CompletionOptions = {},
): Promise<{ content: string; model: string; usage: { prompt: number; completion: number; total: number } }> {
  const model = options.model ?? "openai/gpt-4o";

  const request: OpenRouterRequest = {
    model,
    messages,
    temperature: options.temperature ?? 0.3,
    maxTokens: options.maxTokens ?? 2048,
    responseFormat: { type: "json_object" },
  };

  try {
    const response = await withRetry(async () => executeCompletion(request));

    return {
      content: response.choices[0]?.message?.content ?? "",
      model: response.model ?? model,
      usage: {
        prompt: response.usage?.prompt_tokens ?? 0,
        completion: response.usage?.completion_tokens ?? 0,
        total: response.usage?.total_tokens ?? 0,
      },
    };
  } catch (error) {
    // Attempt fallback model on server errors
    const fallbackModel = "anthropic/claude-3.5-sonnet";
    if (model !== fallbackModel) {
      console.warn(`[OpenRouter] Primary model ${model} failed. Falling back to ${fallbackModel}...`);

      const fallbackRequest: OpenRouterRequest = {
        ...request,
        model: fallbackModel,
      };

      const response = await withRetry(async () => executeCompletion(fallbackRequest));

      return {
        content: response.choices[0]?.message?.content ?? "",
        model: response.model ?? fallbackModel,
        usage: {
          prompt: response.usage?.prompt_tokens ?? 0,
          completion: response.usage?.completion_tokens ?? 0,
          total: response.usage?.total_tokens ?? 0,
        },
      };
    }

    throw error;
  }
}

/**
 * Parse the JSON content from an LLM response.
 * Handles markdown code fences and leading/trailing whitespace.
 */
export function parseJSON<T>(content: string): T {
  let cleaned = content.trim();

  // Remove markdown code fences if present
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1].trim();
  }

  return JSON.parse(cleaned) as T;
}
