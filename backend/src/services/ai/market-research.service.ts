import { complete, parseJSON } from "@/lib/gemini";
import { promptBuilder } from "@/utils/prompt-builder";
import type { MarketResearchOutput } from "@/types/ai";
import type { Idea } from "@prisma/client";

export async function analyzeMarket(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "budget" | "country">): Promise<MarketResearchOutput> {
  const { system, user } = promptBuilder.marketResearch(idea);
  const { content } = await complete([
    { role: "system", content: system },
    { role: "user", content: user },
  ], { temperature: 0.2 });

  return parseJSON<MarketResearchOutput>(content);
}
