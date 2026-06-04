import { prisma } from "@/lib/prisma";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/lib/errors";
import { complete, parseJSON } from "@/lib/gemini";
import type { Prisma } from "@prisma/client";

export interface PitchDeckResponse {
  id: string;
  reportId: string;
  title: string;
  content: PitchDeckSlide[];
  createdAt: string;
  updatedAt: string;
}

export interface PitchDeckSlide {
  type: "title" | "problem" | "solution" | "market" | "business_model" | "competition" | "traction" | "team" | "financials" | "ask";
  title: string;
  content: string;
  bullets?: string[];
}

function serializeDeck(deck: {
  id: string;
  reportId: string;
  title: string;
  content: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): PitchDeckResponse {
  return {
    id: deck.id,
    reportId: deck.reportId,
    title: deck.title,
    content: Array.isArray(deck.content) ? deck.content as unknown as PitchDeckSlide[] : [],
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  };
}

const industryDisplay: Record<string, string> = {
  AI_ML: "AI / ML",
  FINTECH: "Fintech",
  HEALTHTECH: "Healthtech",
  CLIMATE: "Climate",
  DEVTOOLS: "DevTools",
  CONSUMER: "Consumer",
  PRODUCTIVITY: "Productivity",
};

export const pitchDeckService = {
  async generate(reportId: string, userId: string): Promise<PitchDeckResponse> {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { idea: true },
    });

    if (!report) throw new NotFoundError("Report");
    if (report.userId !== userId) throw new ForbiddenError("You don't have access to this report");

    const existing = await prisma.pitchDeck.findFirst({
      where: { reportId, userId },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      await prisma.pitchDeck.delete({ where: { id: existing.id } });
    }

    const idea = report.idea;
    const industry = industryDisplay[idea.industry] ?? idea.industry;

    const promptSystem = `You are a world-class pitch deck writer for venture capital. Generate a comprehensive 10-slide pitch deck for a startup.

For each slide, provide:
- type: one of "title", "problem", "solution", "market", "business_model", "competition", "traction", "team", "financials", "ask"
- title: slide title
- content: 2-3 sentence narrative for the slide
- bullets: 3-5 bullet points with key data points

Respond ONLY with valid JSON in this exact format:
{
  "slides": [
    {
      "type": "string",
      "title": "string",
      "content": "string",
      "bullets": ["string"]
    }
  ]
}

Make each slide investor-ready with specific, actionable content. Use the startup data provided.`;

    const promptUser = `
Startup: ${idea.name}
Industry: ${industry}
Problem: ${idea.problem}
Target Audience: ${idea.audience}
Business Model: ${idea.businessModel}

Validation Report Summary: ${report.summary}

Scores:
- Overall: ${report.overallScore}/100
- Market: ${report.marketScore}/100
- Team: ${report.teamScore}/100
- Moat: ${report.moatScore}/100
- Monetization: ${report.monetizationScore}/100
- Traction: ${report.tractionScore}/100
- Risk: ${report.riskScore}/100

Strengths: ${report.strengths.join(", ")}
Weaknesses: ${report.weaknesses.join(", ")}
Opportunities: ${report.opportunities.join(", ")}
Threats: ${report.threats.join(", ")}

Market Size: TAM=${report.tam ?? "N/A"}, SAM=${report.sam ?? "N/A"}, SOM=${report.som ?? "N/A"}

Generate a complete 10-slide pitch deck.`;

    let slides: PitchDeckSlide[] = [];
    try {
      const { content } = await complete([
        { role: "system", content: promptSystem },
        { role: "user", content: promptUser },
      ], { temperature: 0.4, maxTokens: 4096 });

      const parsed = parseJSON<{ slides: PitchDeckSlide[] }>(content);
      slides = parsed.slides;
    } catch (error) {
      console.error("[PitchDeck] Generation failed:", error);
      slides = this.buildFallbackDeck(idea, report);
    }

    const deck = await prisma.pitchDeck.create({
      data: {
        reportId,
        userId,
        title: `${idea.name} — Pitch Deck`,
        content: slides as unknown as Prisma.JsonArray,
      },
    });

    return serializeDeck(deck);
  },

  async list(userId: string): Promise<PitchDeckResponse[]> {
    const decks = await prisma.pitchDeck.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { report: { select: { id: true, title: true } } },
    });
    return decks.map(serializeDeck);
  },

  async getById(deckId: string, userId: string): Promise<PitchDeckResponse> {
    const deck = await prisma.pitchDeck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundError("PitchDeck");
    if (deck.userId !== userId) throw new ForbiddenError("You don't have access to this deck");
    return serializeDeck(deck);
  },

  async delete(deckId: string, userId: string): Promise<void> {
    const deck = await prisma.pitchDeck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundError("PitchDeck");
    if (deck.userId !== userId) throw new ForbiddenError("You don't have access to this deck");
    await prisma.pitchDeck.delete({ where: { id: deckId } });
  },

  buildFallbackDeck(idea: { name: string; problem: string; audience: string; businessModel: string }, report: { summary: string; overallScore: number; strengths: string[]; opportunities: string[]; tam: string | null; sam: string | null; som: string | null }): PitchDeckSlide[] {
    return [
      { type: "title", title: idea.name, content: `An AI-validated startup in ${report.summary.slice(0, 100)}...`, bullets: [idea.name, `${report.overallScore}/100 Validation Score`] },
      { type: "problem", title: "The Problem", content: idea.problem, bullets: ["Urgent and widespread pain point", "Current solutions are inadequate", "Large addressable market"] },
      { type: "solution", title: "Our Solution", content: `${idea.name} solves this with a ${idea.businessModel}-based approach.`, bullets: [...report.strengths.slice(0, 3)] },
      { type: "market", title: "Market Opportunity", content: `TAM: ${report.tam ?? "Large"}, SAM: ${report.sam ?? "Significant"}, SOM: ${report.som ?? "Attainable"}`, bullets: report.opportunities.slice(0, 4) },
      { type: "business_model", title: "Business Model", content: `Revenue model: ${idea.businessModel}`, bullets: [`Target: ${idea.audience}`, `${idea.businessModel} based pricing`] },
      { type: "competition", title: "Competitive Landscape", content: "Strong competitive positioning with clear differentiation.", bullets: ["First-mover advantage in niche", "Proprietary technology", "Network effects"] },
      { type: "traction", title: "Traction & Validation", content: `Validated with AI-powered analysis scoring ${report.overallScore}/100.`, bullets: ["AI-validated market fit", "Clear problem-solution alignment", "Scalable business model"] },
      { type: "team", title: "The Team", content: "Experienced founding team with domain expertise.", bullets: ["Deep industry knowledge", "Track record of execution", "Strong advisor network"] },
      { type: "financials", title: "Financial Projections", content: `${idea.name} targets strong unit economics and rapid growth.`, bullets: ["Capital-efficient growth model", "Clear path to profitability", "Multiple revenue streams"] },
      { type: "ask", title: "The Ask", content: "Seeking funding to accelerate product development, expand the team, and scale customer acquisition.", bullets: ["Seed round investment", "Product development", "Team expansion", "Go-to-market execution"] },
    ];
  },
};
