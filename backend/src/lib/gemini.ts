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

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    let errorBody: string | undefined;
    try {
      const errorJson = (await response.json()) as { error?: { message: string } };
      errorBody = errorJson.error?.message ?? response.statusText;
    } catch {
      errorBody = response.statusText;
    }
    throw new HttpError(response.status, errorBody ?? "Gemini request failed");
  }

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
    if (model !== aiConfig.gemini.fallbackModel) {
      console.warn(`[Gemini] Primary model ${model} failed. Falling back to ${aiConfig.gemini.fallbackModel}...`);

      const fallbackRequest = { ...geminiRequest };
      const response = await withRetry(async () => executeCompletion(aiConfig.gemini.fallbackModel!, fallbackRequest));

      const candidate = response.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text ?? "";

      return {
        content: text,
        model: aiConfig.gemini.fallbackModel!,
        usage: {
          prompt: response.usageMetadata?.promptTokenCount ?? 0,
          completion: response.usageMetadata?.candidatesTokenCount ?? 0,
          total: response.usageMetadata?.totalTokenCount ?? 0,
        },
      };
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
    if (model !== aiConfig.gemini.fallbackModel) {
      console.warn(`[Gemini] Primary model ${model} failed: ${error instanceof Error ? error.message : error}. Falling back to ${aiConfig.gemini.fallbackModel}...`);

      try {
        const fallbackRequest = { ...geminiRequest };
        const response = await withRetry(async () => executeCompletion(aiConfig.gemini.fallbackModel!, fallbackRequest));

        const candidate = response.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text ?? "";

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
        console.error(`[Gemini] Fallback model ${aiConfig.gemini.fallbackModel} also failed: ${fallbackError instanceof Error ? fallbackError.message : fallbackError}`);
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
