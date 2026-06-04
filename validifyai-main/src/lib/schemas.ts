import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(128),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
});

export const ideaSchema = z.object({
  name: z.string().trim().min(2, "Give your idea a name").max(80),
  industry: z.enum([
    "AI / ML",
    "Fintech",
    "Healthtech",
    "Climate",
    "DevTools",
    "Consumer",
    "Productivity",
  ]),
  problem: z.string().trim().min(20, "Describe the problem (20+ chars)").max(1000),
  audience: z.string().trim().min(2).max(160),
  businessModel: z.enum(["SaaS", "Marketplace", "Transactional", "Usage-based", "Freemium"]),
  budget: z.string().trim().max(40).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  competitors: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type IdeaValues = z.infer<typeof ideaSchema>;
