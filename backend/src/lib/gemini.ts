import { aiConfig } from "@/config/ai";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export interface GeminiMessage {
  role: "user" | "model";
  content: string;
}

export interface GeminiRequest {
  contents: { role: string; parts: { text: string }[] }[];
  systemInstruction?: { parts: { text: string }[] };
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    responseMimeType?: string;
  };
}

export interface GeminiResponse {
  candidates: {
    content: { parts: { text: string }[]; role: string };
    finishReason: string;
  }[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
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
        console.warn(`[Gemini] Attempt ${attempt} failed: ${lastError.message}. Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error("All retry attempts exhausted");
}

function convertMessages(messages: { role: string; content: string }[]): {
  systemInstruction?: { parts: { text: string }[] };
  contents: { role: string; parts: { text: string }[] }[];
} {
  const systemMessages = messages.filter((m) => m.role === "system");
  const nonSystemMessages = messages.filter((m) => m.role !== "system");

  const systemInstruction = systemMessages.length > 0
    ? { parts: [{ text: systemMessages.map((m) => m.content).join("\n") }] }
    : undefined;

  const contents = nonSystemMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  return { systemInstruction, contents };
}

async function executeCompletion(
  model: string,
  request: GeminiRequest,
  signal?: AbortSignal,
): Promise<GeminiResponse> {
  const apiKey = aiConfig.gemini.apiKey();
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;

  console.log(`[Gemini] POST ${model}:generateContent (${JSON.stringify(request.contents).length} bytes)`);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    let errorBody: string | undefined;
    try {
      const errorJson = (await response.json()) as { error?: { message: string; status?: string; code?: number } };
      errorBody = errorJson.error?.message ?? response.statusText;
      console.error(`[Gemini] HTTP ${response.status} — ${errorBody}`);
      if (errorJson.error?.status) {
        console.error(`[Gemini] Status: ${errorJson.error.status}`);
      }
    } catch {
      errorBody = response.statusText;
    }
    throw new HttpError(response.status, errorBody ?? "Gemini request failed");
  }

  console.log(`[Gemini] HTTP 200 — response received`);
  return response.json() as Promise<GeminiResponse>;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function complete(
  messages: { role: string; content: string }[],
  options: CompletionOptions = {},
): Promise<{ content: string; model: string; usage: { prompt: number; completion: number; total: number } }> {
  const model = options.model ?? aiConfig.gemini.primaryModel;
  const { systemInstruction, contents } = convertMessages(messages);

  console.log(`[AI] Gemini primary model: ${model}`);
  console.log(`[AI] Messages: ${messages.length} (system: ${systemInstruction ? 1 : 0}, content: ${contents.length})`);

  const geminiRequest: GeminiRequest = {
    contents,
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxTokens ?? 4096,
      responseMimeType: "application/json",
    },
  };

  try {
    const response = await withRetry(async () => executeCompletion(model, geminiRequest));

    const candidate = response.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text ?? "";

    console.log(`[AI] Gemini response: finish=${candidate?.finishReason}, tokens=${response.usageMetadata?.totalTokenCount}`);

    return {
      content: text,
      model,
      usage: {
        prompt: response.usageMetadata?.promptTokenCount ?? 0,
        completion: response.usageMetadata?.candidatesTokenCount ?? 0,
        total: response.usageMetadata?.totalTokenCount ?? 0,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[AI] Gemini ERROR (${model}): ${errorMessage}`);
    if (error instanceof HttpError) {
      console.error(`[AI] Gemini HTTP ${error.statusCode}: ${error.body ?? error.message}`);
    }

    if (model !== aiConfig.gemini.fallbackModel) {
      console.warn(`[AI] Falling back to ${aiConfig.gemini.fallbackModel}...`);

      const fallbackRequest = { ...geminiRequest };
      try {
        const response = await withRetry(async () => executeCompletion(aiConfig.gemini.fallbackModel!, fallbackRequest));

        const candidate = response.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text ?? "";

        console.log(`[AI] Gemini fallback succeeded: finish=${candidate?.finishReason}`);

        return {
          content: text,
          model: aiConfig.gemini.fallbackModel!,
          usage: {
            prompt: response.usageMetadata?.promptTokenCount ?? 0,
            completion: response.usageMetadata?.candidatesTokenCount ?? 0,
            total: response.usageMetadata?.totalTokenCount ?? 0,
          },
        };
      } catch (fallbackError) {
        const fbMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.error(`[AI] Gemini fallback ALSO failed: ${fbMessage}`);
        throw fallbackError;
      }
    }

    throw error;
  }
}

export async function completeChat(
  messages: { role: string; content: string }[],
  options: CompletionOptions = {},
): Promise<{ content: string; model: string; usage: { prompt: number; completion: number; total: number } }> {
  const model = options.model ?? aiConfig.gemini.primaryModel;
  const { systemInstruction, contents } = convertMessages(messages);

  console.log(`[AI] Chat — Gemini primary model: ${model}`);
  console.log(`[AI] Chat — Messages: ${messages.length} (system: ${systemInstruction ? 1 : 0}, content: ${contents.length})`);

  const geminiRequest: GeminiRequest = {
    contents,
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 1024,
    },
  };

  try {
    const response = await withRetry(async () => executeCompletion(model, geminiRequest));

    const candidate = response.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text ?? "";

    console.log(`[AI] Chat — Gemini response: finish=${candidate?.finishReason}, tokens=${response.usageMetadata?.totalTokenCount}`);

    return {
      content: text,
      model,
      usage: {
        prompt: response.usageMetadata?.promptTokenCount ?? 0,
        completion: response.usageMetadata?.candidatesTokenCount ?? 0,
        total: response.usageMetadata?.totalTokenCount ?? 0,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[AI] Chat — Gemini ERROR (${model}): ${errorMessage}`);
    if (error instanceof HttpError) {
      console.error(`[AI] Chat — Gemini HTTP ${error.statusCode}: ${error.body ?? error.message}`);
    }

    if (model !== aiConfig.gemini.fallbackModel) {
      console.warn(`[AI] Chat — Falling back to ${aiConfig.gemini.fallbackModel}...`);

      try {
        const fallbackRequest = { ...geminiRequest };
        const response = await withRetry(async () => executeCompletion(aiConfig.gemini.fallbackModel!, fallbackRequest));

        const candidate = response.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text ?? "";

        console.log(`[AI] Chat — Gemini fallback succeeded: finish=${candidate?.finishReason}`);

        return {
          content: text,
          model: aiConfig.gemini.fallbackModel!,
          usage: {
            prompt: response.usageMetadata?.promptTokenCount ?? 0,
            completion: response.usageMetadata?.candidatesTokenCount ?? 0,
            total: response.usageMetadata?.totalTokenCount ?? 0,
          },
        };
      } catch (fallbackError) {
        const fbMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.error(`[AI] Chat — Gemini fallback ALSO failed: ${fbMessage}`);
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
 * Test connectivity to the Gemini API.
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
    const apiKey = aiConfig.gemini.apiKey();
    const model = aiConfig.gemini.primaryModel;
    const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
    const body = JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "Hi" }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 10 },
    });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      let errorMsg = res.statusText;
      try {
        const errJson = (await res.json()) as { error?: { message: string; status?: string } };
        errorMsg = errJson.error?.message ?? errorMsg;
        if (errJson.error?.status) {
          errorMsg = `${errJson.error.status}: ${errorMsg}`;
        }
      } catch { /* ignore */ }
      return { ok: false, latencyMs, status: res.status, error: errorMsg };
    }

    return { ok: true, latencyMs, model };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, latencyMs, error: msg };
  }
}
