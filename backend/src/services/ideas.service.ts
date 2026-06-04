import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type { Idea, Industry, BusinessModel } from "@prisma/client";
import type { CreateIdeaInput } from "@/schemas/idea.schema";

const industryMap: Record<string, Industry> = {
  "AI / ML": "AI_ML",
  Fintech: "FINTECH",
  Healthtech: "HEALTHTECH",
  Climate: "CLIMATE",
  DevTools: "DEVTOOLS",
  Consumer: "CONSUMER",
  Productivity: "PRODUCTIVITY",
};

const businessModelMap: Record<string, BusinessModel> = {
  SaaS: "SAAS",
  Marketplace: "MARKETPLACE",
  Transactional: "TRANSACTIONAL",
  "Usage-based": "USAGE_BASED",
  Freemium: "FREEMIUM",
};

const reverseIndustryMap: Record<string, string> = Object.fromEntries(
  Object.entries(industryMap).map(([k, v]) => [v, k]),
);

const reverseBusinessModelMap: Record<string, string> = Object.fromEntries(
  Object.entries(businessModelMap).map(([k, v]) => [v, k]),
);

export interface IdeaResponse {
  id: string;
  name: string;
  industry: string;
  problem: string;
  audience: string;
  businessModel: string;
  budget?: string;
  country?: string;
  competitors?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function serializeIdea(idea: Idea): IdeaResponse {
  return {
    id: idea.id,
    name: idea.name,
    industry: reverseIndustryMap[idea.industry] ?? idea.industry,
    problem: idea.problem,
    audience: idea.audience,
    businessModel: reverseBusinessModelMap[idea.businessModel] ?? idea.businessModel,
    budget: idea.budget ?? undefined,
    country: idea.country ?? undefined,
    competitors: idea.competitors,
    notes: idea.notes ?? undefined,
    createdAt: idea.createdAt.toISOString(),
    updatedAt: idea.updatedAt.toISOString(),
  };
}

function parseCompetitors(input: string | string[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return input.split(",").map(s => s.trim()).filter(Boolean);
}

export const ideasService = {
  async list(userId: string): Promise<IdeaResponse[]> {
    const ideas = await prisma.idea.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return ideas.map(serializeIdea);
  },

  async create(userId: string, input: CreateIdeaInput): Promise<IdeaResponse> {
    const idea = await prisma.idea.create({
      data: {
        userId,
        name: input.name,
        industry: industryMap[input.industry] ?? input.industry,
        problem: input.problem,
        audience: input.audience,
        businessModel: businessModelMap[input.businessModel] ?? input.businessModel,
        budget: input.budget,
        country: input.country,
        competitors: parseCompetitors(input.competitors),
        notes: input.notes,
      },
    });
    return serializeIdea(idea);
  },

  async getById(ideaId: string, userId: string): Promise<IdeaResponse> {
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea || idea.deletedAt) throw new NotFoundError("Idea");
    if (idea.userId !== userId) throw new NotFoundError("Idea");
    return serializeIdea(idea);
  },
};
