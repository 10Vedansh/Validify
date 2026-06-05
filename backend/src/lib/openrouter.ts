import { aiConfig } from "@/config/ai";

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

async function executeCompletion(
  request: OpenRouterRequest,
  signal?: AbortSignal,
): Promise<OpenRouterResponse> {
  const apiKey = aiConfig.openrouter.apiKey();

  console.log(`[OpenRouter] POST ${request.model} (${request.messages.length} messages, ${JSON.stringify(request.messages).length} bytes)`);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
      console.error(`[OpenRouter] HTTP ${response.status} — ${errorBody}`);
    } catch {
      errorBody = response.statusText;
    }
    throw new HttpError(response.status, errorBody ?? "OpenRouter request failed");
  }

  console.log(`[OpenRouter] HTTP 200 — response received`);
  return response.json() as Promise<OpenRouterResponse>;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function complete(
  messages: OpenRouterMessage[],
  options: CompletionOptions = {},
): Promise<{ content: string; model: string; usage: { prompt: number; completion: number; total: number } }> {
  const model = options.model ?? aiConfig.openrouter.primaryModel;

  console.log(`[AI] OpenRouter primary model: ${model}`);

  const request: OpenRouterRequest = {
    model,
    messages,
    temperature: options.temperature ?? 0.3,
    maxTokens: options.maxTokens ?? 2048,
    responseFormat: { type: "json_object" },
  };

  try {
    const response = await withRetry(async () => executeCompletion(request));

    console.log(`[AI] OpenRouter response: model=${response.model}, tokens=${response.usage?.total_tokens}`);

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[AI] OpenRouter ERROR (${model}): ${errorMessage}`);
    if (error instanceof HttpError) {
      console.error(`[AI] OpenRouter HTTP ${error.statusCode}: ${error.body ?? error.message}`);
    }

    const fallbackModel = aiConfig.openrouter.fallbackModel;
    if (model !== fallbackModel) {
      console.warn(`[AI] OpenRouter falling back to ${fallbackModel}...`);

      const fallbackRequest: OpenRouterRequest = {
        ...request,
        model: fallbackModel,
      };

      try {
        const response = await withRetry(async () => executeCompletion(fallbackRequest));

        console.log(`[AI] OpenRouter fallback succeeded`);

        return {
          content: response.choices[0]?.message?.content ?? "",
          model: response.model ?? fallbackModel,
          usage: {
            prompt: response.usage?.prompt_tokens ?? 0,
            completion: response.usage?.completion_tokens ?? 0,
            total: response.usage?.total_tokens ?? 0,
          },
        };
      } catch (fallbackError) {
        const fbMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.error(`[AI] OpenRouter fallback ALSO failed: ${fbMessage}`);
        throw fallbackError;
      }
    }

    throw error;
  }
}

export function parseJSON<T>(content: string): T {
  let cleaned = content.trim();

  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1].trim();
  }

  return JSON.parse(cleaned) as T;
}

/**
 * Test connectivity to the OpenRouter API.
 * Sends a minimal prompt and returns the connection status.
 */
export async function testConnection(): Promise<{
  ok: boolean;
  latencyMs: number;
  status?: number;
  error?: string;
  model?: string;
}> {
  const start = Date.now();
  try {
    const apiKey = aiConfig.openrouter.apiKey();
    const model = aiConfig.openrouter.primaryModel;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://validify.app",
        "X-Title": "Validify",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 10,
      }),
    });

    const latencyMs = Date.now() - start;

    if (!response.ok) {
      let errorMsg = response.statusText;
      try {
        const errJson = (await response.json()) as OpenRouterError;
        errorMsg = errJson.error?.message ?? errorMsg;
      } catch { /* ignore */ }
      return { ok: false, latencyMs, status: response.status, error: errorMsg };
    }

    return { ok: true, latencyMs, model };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, latencyMs, error: msg };
  }
}
