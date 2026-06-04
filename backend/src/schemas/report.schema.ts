import { z } from "zod";

/**
 * Request validation schemas for report endpoints.
 */

export const generateReportSchema = z.object({
  ideaId: z.string().optional(),
  name: z.string().trim().min(2, "Give your idea a name").max(80).optional(),
  industry: z.enum(["AI / ML", "Fintech", "Healthtech", "Climate", "DevTools", "Consumer", "Productivity"]).optional(),
  problem: z.string().trim().min(20, "Describe the problem (20+ chars)").max(1000).optional(),
  audience: z.string().trim().min(2).max(160).optional(),
  businessModel: z.enum(["SaaS", "Marketplace", "Transactional", "Usage-based", "Freemium"]).optional(),
  budget: z.string().trim().max(40).optional(),
  country: z.string().trim().max(60).optional(),
  competitors: z.array(z.string()).optional(),
  notes: z.string().trim().max(1000).optional(),
}).refine(
  (data) => data.ideaId || (data.name && data.industry && data.problem && data.audience && data.businessModel),
  {
    message: "Provide either an existing ideaId, or all required idea fields (name, industry, problem, audience, businessModel)",
  },
);

export const listReportsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  industry: z.string().optional(),
  sortBy: z.enum(["createdAt", "title", "overallScore"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type ListReportsInput = z.infer<typeof listReportsSchema>;
