import { complete, parseJSON } from "@/lib/gemini";
import { promptBuilder } from "@/utils/prompt-builder";
import type { RevenueModelOutput } from "@/types/ai";
import type { Idea } from "@prisma/client";

export async function analyzeRevenueModel(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "budget">): Promise<RevenueModelOutput> {
  const { system, user } = promptBuilder.revenueModel(idea);
  const { content } = await complete([
    { role: "system", content: system },
    { role: "user", content: user },
  ], { temperature: 0.3 });

  return parseJSON<RevenueModelOutput>(content);
}
