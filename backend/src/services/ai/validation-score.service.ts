import { complete, parseJSON } from "@/lib/gemini";
import { promptBuilder } from "@/utils/prompt-builder";
import type { ValidationScoreOutput } from "@/types/ai";
import type { Idea } from "@prisma/client";

export async function calculateScores(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "budget" | "country" | "competitors" | "notes">): Promise<ValidationScoreOutput> {
  const { system, user } = promptBuilder.validationScores(idea);
  const { content } = await complete([
    { role: "system", content: system },
    { role: "user", content: user },
  ], { temperature: 0.2 });

  return parseJSON<ValidationScoreOutput>(content);
}
