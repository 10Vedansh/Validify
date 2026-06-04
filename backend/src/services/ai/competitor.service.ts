import { complete, parseJSON } from "@/lib/gemini";
import { promptBuilder } from "@/utils/prompt-builder";
import type { CompetitorOutput } from "@/types/ai";
import type { Idea } from "@prisma/client";

export async function analyzeCompetitors(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "competitors">): Promise<CompetitorOutput> {
  const { system, user } = promptBuilder.competitorAnalysis(idea);
  const { content } = await complete([
    { role: "system", content: system },
    { role: "user", content: user },
  ], { temperature: 0.3 });

  return parseJSON<CompetitorOutput>(content);
}
