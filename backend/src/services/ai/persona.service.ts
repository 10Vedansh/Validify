import { complete, parseJSON } from "@/lib/gemini";
import { promptBuilder } from "@/utils/prompt-builder";
import type { PersonaOutput } from "@/types/ai";
import type { Idea } from "@prisma/client";

export async function analyzePersonas(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "country">): Promise<PersonaOutput> {
  const { system, user } = promptBuilder.personaAnalysis(idea);
  const { content } = await complete([
    { role: "system", content: system },
    { role: "user", content: user },
  ], { temperature: 0.3 });

  return parseJSON<PersonaOutput>(content);
}
