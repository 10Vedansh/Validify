import { prisma } from "@/lib/prisma";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { aiConfig } from "@/config/ai";
import { completeChat, HttpError as GeminiHttpError } from "@/lib/gemini";
import { complete as openRouterComplete, HttpError as OrHttpError } from "@/lib/openrouter";

export interface ChatThreadResponse {
  id: string;
  title: string;
  updatedAt: string;
}

export interface ChatMessageResponse {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

function serializeThread(thread: { id: string; title: string; updatedAt: Date }): ChatThreadResponse {
  return {
    id: thread.id,
    title: thread.title,
    updatedAt: thread.updatedAt.toISOString(),
  };
}

function serializeMessage(msg: { id: string; role: string; content: string; createdAt: Date }): ChatMessageResponse {
  return {
    id: msg.id,
    role: msg.role as "user" | "assistant" | "system",
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
  };
}

function formatAiError(error: unknown): string {
  if (error instanceof GeminiHttpError) {
    const status = error.statusCode;
    const body = error.body ?? error.message;
    if (status === 429) return `AI Rate Limit: ${body}`;
    if (status === 401 || status === 403) return `AI Authentication Failed: ${body}`;
    if (status === 404) return `AI Model Not Found: ${body}`;
    if (status === 400) return `AI Request Error: ${body}`;
    if (status >= 500) return `AI Provider Error (${status}): ${body}`;
    return `AI Error (${status}): ${body}`;
  }
  if (error instanceof OrHttpError) {
    return `AI Fallback Error (${error.statusCode}): ${error.body ?? error.message}`;
  }
  if (error instanceof TypeError && error.message === "fetch failed") {
    return "AI Provider Unreachable — check network or API endpoint";
  }
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("API_KEY")) return "AI Provider: Invalid or missing API key";
  if (message.includes("quota") || message.includes("rate limit")) return "AI Provider: Rate limit exceeded";
  return `AI Error: ${message}`;
}

export const chatService = {
  async listThreads(userId: string): Promise<ChatThreadResponse[]> {
    const threads = await prisma.chatThread.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    return threads.map(serializeThread);
  },

  async createThread(userId: string, title: string, ideaId?: string): Promise<ChatThreadResponse> {
    const thread = await prisma.chatThread.create({
      data: { userId, title, ideaId },
    });
    return serializeThread(thread);
  },

  async getMessages(threadId: string, userId: string): Promise<ChatMessageResponse[]> {
    const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
    if (!thread) throw new NotFoundError("Thread");
    if (thread.userId !== userId) throw new ForbiddenError();

    const messages = await prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
    });
    return messages.map(serializeMessage);
  },

  async sendMessage(threadId: string, userId: string, content: string): Promise<ChatMessageResponse> {
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      include: { idea: true },
    });
    if (!thread) throw new NotFoundError("Thread");
    if (thread.userId !== userId) throw new ForbiddenError();

    await prisma.chatMessage.create({
      data: { threadId, role: "user", content },
    });

    const previousMessages = await prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const systemPrompt = `You are Validify's AI Co-Founder — an expert startup advisor, strategist, and mentor. You help entrepreneurs validate ideas, refine business models, understand markets, and plan go-to-market strategies.

Be concise, data-driven, and supportive. Focus on actionable advice. If asked about the startup's specific idea, reference the context provided below.

Current startup context: ${thread.idea ? `Name: ${thread.idea.name}, Industry: ${thread.idea.industry}, Problem: ${thread.idea.problem}, Target: ${thread.idea.audience}, Business Model: ${thread.idea.businessModel}` : "General startup advice — no specific idea linked."}

Guidelines:
- Provide specific, actionable startup advice
- Be encouraging but honest about challenges
- Use data and frameworks where helpful
- Keep responses concise (2-4 paragraphs)`;

    const conversationHistory = previousMessages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    const geminiMessages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
    ];

    let assistantContent = "";
    let modelUsed = "";
    let tokensIn = 0;
    let tokensOut = 0;
    let errorDetails = "";

    try {
      const result = await completeChat(geminiMessages, { temperature: 0.7, maxTokens: 1024 });
      assistantContent = result.content;
      modelUsed = result.model;
      tokensIn = result.usage.prompt;
      tokensOut = result.usage.completion;
    } catch (error) {
      const primaryError = formatAiError(error);
      console.error(`[Chat] Gemini failed: ${primaryError}`);
      if (error instanceof Error && error.stack) {
        console.error(`[Chat] Stack: ${error.stack.split("\n").slice(0, 3).join("\n")}`);
      }

      let openRouterAvailable = false;
      try {
        aiConfig.openrouter.apiKey();
        openRouterAvailable = true;
      } catch {
        openRouterAvailable = false;
      }

      if (openRouterAvailable) {
        console.warn(`[Chat] Trying OpenRouter fallback...`);
        try {
          const openRouterMessages = geminiMessages.map((m) => ({
            role: m.role as "system" | "user" | "assistant",
            content: m.content,
          }));
          const result = await openRouterComplete(openRouterMessages, {
            model: aiConfig.openrouter.primaryModel,
            temperature: 0.7,
            maxTokens: 1024,
          });
          assistantContent = result.content;
          modelUsed = result.model;
          tokensIn = result.usage.prompt;
          tokensOut = result.usage.completion;
          console.log(`[Chat] OpenRouter fallback succeeded: model=${modelUsed}`);
        } catch (orError) {
          const fallbackError = formatAiError(orError);
          console.error(`[Chat] OpenRouter fallback also failed: ${fallbackError}`);
          errorDetails = `Gemini: ${primaryError} | OpenRouter: ${fallbackError}`;
          assistantContent = `I'm having trouble with the AI service right now.\n\nDetails: ${errorDetails}`;
        }
      } else {
        errorDetails = primaryError;
        assistantContent = `I'm having trouble with the AI service right now.\n\nDetails: ${errorDetails}\n\nTo fix this, set a valid GEMINI_API_KEY (or OPENROUTER_API_KEY) in your Render environment variables.`;
      }
    }

    const assistantMsg = await prisma.chatMessage.create({
      data: {
        threadId,
        role: "assistant",
        content: assistantContent,
        model: modelUsed || null,
        tokensIn: tokensIn || null,
        tokensOut: tokensOut || null,
      },
    });

    await prisma.chatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    return serializeMessage(assistantMsg);
  },
};
