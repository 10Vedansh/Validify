import { prisma } from "@/lib/prisma";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { completeChat } from "@/lib/gemini";
import { complete as openRouterComplete } from "@/lib/openrouter";

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

    try {
      const result = await completeChat(geminiMessages, { temperature: 0.7, maxTokens: 1024 });
      assistantContent = result.content;
      modelUsed = result.model;
      tokensIn = result.usage.prompt;
      tokensOut = result.usage.completion;
    } catch (error) {
      console.error("[Chat] Gemini response failed:", error instanceof Error ? error.message : error);

      // Try OpenRouter as secondary fallback if configured
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (openRouterKey) {
        try {
          const openRouterMessages = geminiMessages.map((m) => ({
            role: m.role as "system" | "user" | "assistant",
            content: m.content,
          }));
          const result = await openRouterComplete(openRouterMessages, {
            model: "openai/gpt-4o-mini",
            temperature: 0.7,
            maxTokens: 1024,
          });
          assistantContent = result.content;
          modelUsed = result.model;
          tokensIn = result.usage.prompt;
          tokensOut = result.usage.completion;
        } catch (orError) {
          console.error("[Chat] OpenRouter fallback also failed:", orError instanceof Error ? orError.message : orError);
          assistantContent = "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.";
        }
      } else {
        assistantContent = "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.";
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
