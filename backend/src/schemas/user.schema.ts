import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80).optional(),
  avatarUrl: z.string().url().max(500).optional().or(z.literal("")),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
