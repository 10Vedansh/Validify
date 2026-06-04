import { z } from "zod";

export const createIdeaSchema = z.object({
  name: z.string().trim().min(2, "Give your idea a name").max(80),
  industry: z.enum(["AI / ML", "Fintech", "Healthtech", "Climate", "DevTools", "Consumer", "Productivity"]),
  problem: z.string().trim().min(20, "Describe the problem (20+ chars)").max(1000),
  audience: z.string().trim().min(2).max(160),
  businessModel: z.enum(["SaaS", "Marketplace", "Transactional", "Usage-based", "Freemium"]),
  budget: z.string().trim().max(40).optional(),
  country: z.string().trim().max(60).optional(),
  competitors: z.union([z.array(z.string()), z.string()]).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
