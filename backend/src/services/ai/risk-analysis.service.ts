import { complete, parseJSON } from "@/lib/gemini";
import { promptBuilder } from "@/utils/prompt-builder";
import type { RiskAnalysisOutput } from "@/types/ai";
import type { Idea } from "@prisma/client";

export async function analyzeRisks(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "budget" | "country">): Promise<RiskAnalysisOutput> {
  const { system, user } = promptBuilder.riskAnalysis(idea);
  const { content } = await complete([
    { role: "system", content: system },
    { role: "user", content: user },
  ], { temperature: 0.2 });

  return parseJSON<RiskAnalysisOutput>(content);
}
