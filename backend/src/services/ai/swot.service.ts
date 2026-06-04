import { complete, parseJSON } from "@/lib/gemini";
import { promptBuilder } from "@/utils/prompt-builder";
import type { SWOTOutput } from "@/types/ai";
import type { Idea } from "@prisma/client";

export async function analyzeSWOT(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "competitors">): Promise<SWOTOutput> {
  const { system, user } = promptBuilder.swotAnalysis(idea);
  const { content } = await complete([
    { role: "system", content: system },
    { role: "user", content: user },
  ], { temperature: 0.3 });

  return parseJSON<SWOTOutput>(content);
}
