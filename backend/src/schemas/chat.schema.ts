import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Message is required").max(4000),
});

export const createThreadSchema = z.object({
  title: z.string().trim().min(1).max(160),
  ideaId: z.string().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;
