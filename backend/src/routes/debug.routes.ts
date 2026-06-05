import { Hono } from "hono";
import { env } from "@/config/env";
import { getAiStatus } from "@/config/ai";
import { complete, testConnection as testGemini, HttpError as GeminiHttpError } from "@/lib/gemini";
import { complete as orComplete, testConnection as testOpenRouter, HttpError as OrHttpError } from "@/lib/openrouter";

const router = new Hono();

// ─── GET /debug/health/ai ───────────────────────────────────────────
// Returns AI provider configuration + live connectivity test for both.
router.get("/health/ai", async (c) => {
  const status = getAiStatus();
  const result: Record<string, unknown> = {
    configured: status.gemini.configured || status.openrouter.configured,
    providers: status,
    timestamp: new Date().toISOString(),
  };

  // Test live connectivity
  if (status.gemini.configured) {
    result.gemini_test = await testGemini();
  }
  if (status.openrouter.configured) {
    result.openrouter_test = await testOpenRouter();
  }

  if (!status.gemini.configured && !status.openrouter.configured) {
    result.status = "unconfigured";
    result.reason = "No AI provider configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY.";
    result.fix = {
      gemini: "https://aistudio.google.com/app/apikey",
      openrouter: "https://openrouter.ai/keys",
    };
    return c.json(result, 503);
  }

  return c.json(result);
});

// ─── POST /debug/test-ai ────────────────────────────────────────────
// Sends a test prompt to the configured AI provider and returns raw result.
router.post("/test-ai", async (c) => {
  const reqBody = await c.req.json().catch(() => ({}));
  const userPrompt = (reqBody as { prompt?: string }).prompt ?? "Reply with exactly: OK. No other text.";

  const logs: string[] = [];
  const capture = (msg: string) => { logs.push(msg); console.log(`[DebugTest] ${msg}`); };

  const result: Record<string, unknown> = {
    prompt: userPrompt,
    timestamp: new Date().toISOString(),
  };

  // Try Gemini first
  if (env.GEMINI_API_KEY) {
    capture(`Trying Gemini model=${env.GEMINI_MODEL}...`);
    try {
      const response = await complete(
        [{ role: "user", content: userPrompt }],
        { temperature: 0.1, maxTokens: 50 },
      );
      capture(`SUCCESS: model=${response.model}, tokens=${response.usage.total}`);
      result.provider = "gemini";
      result.model = response.model;
      result.response = response.content;
      result.usage = response.usage;
      result.logs = logs;
      return c.json(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      capture(`FAILED: ${msg}`);
      if (err instanceof GeminiHttpError) {
        capture(`HTTP ${err.statusCode}: ${err.body ?? ""}`);
        if (err.statusCode === 429) {
          capture("DETAIL: Gemini free-tier quota exhausted. Set a new key with billing enabled, or use OpenRouter.");
        }
      }
      result.gemini_error = msg;
    }
  } else {
    capture("Gemini skipped — no GEMINI_API_KEY set");
  }

  // Fallback to OpenRouter
  if (env.OPENROUTER_API_KEY) {
    const { aiConfig } = await import("@/config/ai");
    capture(`Trying OpenRouter model=${aiConfig.openrouter.primaryModel}...`);
    try {
      const response = await orComplete(
        [{ role: "user", content: userPrompt }],
        { model: aiConfig.openrouter.primaryModel, temperature: 0.1, maxTokens: 50 },
      );
      capture(`SUCCESS: model=${response.model}, tokens=${response.usage.total}`);
      result.provider = "openrouter";
      result.model = response.model;
      result.response = response.content;
      result.usage = response.usage;
      result.logs = logs;
      return c.json(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      capture(`FAILED: ${msg}`);
      if (err instanceof OrHttpError) {
        capture(`HTTP ${err.statusCode}: ${err.body ?? ""}`);
      }
      result.openrouter_error = msg;
    }
  } else {
    capture("OpenRouter skipped — no OPENROUTER_API_KEY set");
  }

  result.status = "error";
  result.reason = "All AI providers failed";
  result.logs = logs;
  return c.json(result, 502);
});

export { router as debugRoutes };
