import type { Context } from "hono";
import { chatService } from "@/services/chat.service";
import type { SendMessageInput, CreateThreadInput } from "@/schemas/chat.schema";

export const chatController = {
  async listThreads(c: Context) {
    const userId = c.get("userId");
    const threads = await chatService.listThreads(userId);
    return c.json(threads);
  },

  async createThread(c: Context) {
    const userId = c.get("userId");
    const body = c.req.valid("json" as never) as CreateThreadInput;
    const thread = await chatService.createThread(userId, body.title, body.ideaId);
    return c.json(thread, 201);
  },

  async getMessages(c: Context) {
    const threadId = c.req.param("id")!;
    const userId = c.get("userId");
    const messages = await chatService.getMessages(threadId, userId);
    return c.json(messages);
  },

  async sendMessage(c: Context) {
    const threadId = c.req.param("id")!;
    const userId = c.get("userId");
    const body = c.req.valid("json" as never) as SendMessageInput;
    const message = await chatService.sendMessage(threadId, userId, body.content);
    return c.json(message, 201);
  },
};
