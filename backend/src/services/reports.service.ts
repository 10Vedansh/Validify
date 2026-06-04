import { prisma } from "@/lib/prisma";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/lib/errors";
import { validateStartup } from "@/services/ai/orchestrator.service";
import type { Prisma, Industry, BusinessModel } from "@prisma/client";

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

/**
 * Report service.
 *
 * Handles CRUD operations for reports and the AI-powered generation flow.
 * The key design decision is to map the denormalized Prisma Report model
 * to the nested frontend Report type (score, swot, competitors, roadmap).
 */

// ─── Types ────────────────────────────────────────────────────────────

/**
 * Matches the frontend `Report` type at validifyai-main/src/types/report.ts
 */
export interface ReportResponse {
  id: string;
  ideaId: string;
  title: string;
  summary: string;
  industry: string;
  score: {
    overall: number;
    market: number;
    team: number;
    moat: number;
    monetization: number;
    traction: number;
    risk: number;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitors: { name: string; score: number; url?: string }[];
  roadmap: { quarter: string; label: string }[];
  createdAt: string;
}

// ─── Serialization ────────────────────────────────────────────────────

/**
 * Convert a Prisma Report (with denormalized columns) into the nested
 * frontend Report shape.
 */
function serializeReport(report: {
  id: string;
  ideaId: string;
  title: string;
  summary: string;
  industry: string;
  overallScore: number;
  marketScore: number;
  teamScore: number;
  moatScore: number;
  monetizationScore: number;
  tractionScore: number;
  riskScore: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  competitors: Prisma.JsonValue;
  roadmap: Prisma.JsonValue;
  createdAt: Date;
}): ReportResponse {
  return {
    id: report.id,
    ideaId: report.ideaId,
    title: report.title,
    summary: report.summary,
    industry: reverseIndustryMap[report.industry] ?? report.industry,
    score: {
      overall: report.overallScore,
      market: report.marketScore,
      team: report.teamScore,
      moat: report.moatScore,
      monetization: report.monetizationScore,
      traction: report.tractionScore,
      risk: report.riskScore,
    },
    swot: {
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      opportunities: report.opportunities,
      threats: report.threats,
    },
    competitors: Array.isArray(report.competitors)
      ? (report.competitors as { name: string; score: number; url?: string }[])
      : [],
    roadmap: Array.isArray(report.roadmap)
      ? (report.roadmap as { quarter: string; label: string }[])
      : [],
    createdAt: report.createdAt.toISOString(),
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────

export const reportsService = {
  /**
   * Generate a new validation report.
   *
   * POST /reports/generate
   *
   * Accepts either an existing ideaId or a complete idea draft.
   * Creates the idea if needed, runs the AI orchestrator, and persists
   * both the Validation and Report records.
   */
  async generate(userId: string, input: {
    ideaId?: string;
    name?: string;
    industry?: string;
    problem?: string;
    audience?: string;
    businessModel?: string;
    budget?: string;
    country?: string;
    competitors?: string[];
    notes?: string;
  }): Promise<ReportResponse> {
    // ─── Resolve or create the idea ─────────────────────────────────
    let idea;
    if (input.ideaId) {
      idea = await prisma.idea.findUnique({ where: { id: input.ideaId } });
      if (!idea || idea.deletedAt) throw new NotFoundError("Idea");
      if (idea.userId !== userId) throw new NotFoundError("Idea");
    } else {
      if (!input.name || !input.industry || !input.problem || !input.audience || !input.businessModel) {
        throw new BadRequestError("Missing required idea fields");
      }
      idea = await prisma.idea.create({
        data: {
          userId,
          name: input.name,
          industry: industryMap[input.industry!] ?? input.industry!,
          problem: input.problem,
          audience: input.audience,
          businessModel: businessModelMap[input.businessModel!] ?? input.businessModel!,
          budget: input.budget,
          country: input.country,
          competitors: input.competitors ?? [],
          notes: input.notes,
        },
      });
    }

    // ─── Create validation record ───────────────────────────────────
    const validation = await prisma.validation.create({
      data: { ideaId: idea.id, userId, status: "RUNNING" },
    });

    // ─── Run AI orchestrator ────────────────────────────────────────
    const report = await validateStartup(idea);

    // ─── Update validation with scores ──────────────────────────────
    await prisma.validation.update({
      where: { id: validation.id },
      data: {
        status: "COMPLETE",
        overallScore: report.score.overall,
        marketScore: report.score.market,
        teamScore: report.score.team,
        moatScore: report.score.moat,
        monetizationScore: report.score.monetization,
        tractionScore: report.score.traction,
        riskScore: report.score.risk,
        completedAt: new Date(),
      },
    });

    // ─── Save report ────────────────────────────────────────────────
    const saved = await prisma.report.create({
      data: {
        ideaId: idea.id,
        validationId: validation.id,
        userId,
        title: `${idea.name} — Validation Report`,
        summary: report.summary,
        industry: reverseIndustryMap[idea.industry] ?? idea.industry,
        overallScore: report.score.overall,
        marketScore: report.score.market,
        teamScore: report.score.team,
        moatScore: report.score.moat,
        monetizationScore: report.score.monetization,
        tractionScore: report.score.traction,
        riskScore: report.score.risk,
        strengths: report.swot.strengths,
        weaknesses: report.swot.weaknesses,
        opportunities: report.swot.opportunities,
        threats: report.swot.threats,
        competitors: report.competitors as unknown as Prisma.JsonArray,
        roadmap: report.roadmap as unknown as Prisma.JsonArray,
        tam: report.marketResearch.tam,
        sam: report.marketResearch.sam,
        som: report.marketResearch.som,
      },
    });

    return serializeReport(saved);
  },

  /**
   * List reports for the current user with pagination and filtering.
   *
   * GET /reports?page=1&pageSize=10&search=neuro&industry=AI / ML
   */
  async list(
    userId: string,
    params: {
      search?: string;
      industry?: string;
      sortBy?: "createdAt" | "title" | "overallScore";
      sortOrder?: "asc" | "desc";
    },
  ): Promise<ReportResponse[]> {
    const where: Prisma.ReportWhereInput = { userId };

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { summary: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.industry) {
      where.industry = { equals: params.industry, mode: "insensitive" };
    }

    const orderBy: Prisma.ReportOrderByWithRelationInput = {};
    orderBy[params.sortBy ?? "createdAt"] = params.sortOrder ?? "desc";

    const rows = await prisma.report.findMany({
      where,
      orderBy,
    });

    return rows.map(serializeReport);
  },

  /**
   * Get a single report by ID.
   *
   * GET /reports/:id
   */
  async getById(reportId: string, userId: string): Promise<ReportResponse> {
    const report = await prisma.report.findUnique({ where: { id: reportId } });

    if (!report) throw new NotFoundError("Report");
    if (report.userId !== userId) throw new ForbiddenError("You don't have access to this report");

    return serializeReport(report);
  },

  /**
   * Delete a report by ID.
   *
   * DELETE /reports/:id
   */
  async delete(reportId: string, userId: string): Promise<void> {
    const report = await prisma.report.findUnique({ where: { id: reportId } });

    if (!report) throw new NotFoundError("Report");
    if (report.userId !== userId) throw new ForbiddenError("You don't have access to this report");

    await prisma.report.delete({ where: { id: reportId } });
  },
};
