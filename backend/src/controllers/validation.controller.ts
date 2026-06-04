import type { Context } from "hono";
import { prisma } from "@/lib/prisma";
import { validateStartup } from "@/services/ai/orchestrator.service";
import { NotFoundError } from "@/lib/errors";
import type { Idea, Prisma } from "@prisma/client";

const reverseIndustryMap: Record<string, string> = {
  AI_ML: "AI / ML",
  FINTECH: "Fintech",
  HEALTHTECH: "Healthtech",
  CLIMATE: "Climate",
  DEVTOOLS: "DevTools",
  CONSUMER: "Consumer",
  PRODUCTIVITY: "Productivity",
};

/**
 * Validation controller.
 *
 * Handles the validate-idea flow:
 *   1. Start validation (async — creates Validation record, runs AI)
 *   2. Get validation status
 *   3. Get completed report
 */

export const validationController = {
  /**
   * Start a validation run for an idea.
   *
   * POST /ideas/:id/validate
   * Auth: required
   *
   * Creates a Validation record with status RUNNING, runs the AI
   * orchestrator, saves the results, and returns the completed report.
   */
  async start(c: Context) {
    const ideaId = c.req.param("id");
    const userId = c.get("userId");

    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea || idea.deletedAt) {
      throw new NotFoundError("Idea");
    }
    if (idea.userId !== userId) {
      throw new NotFoundError("Idea");
    }

    // Create validation record
    const validation = await prisma.validation.create({
      data: {
        ideaId: idea.id,
        userId,
        status: "RUNNING",
      },
    });

    // Run AI orchestrator (this may take 30-60 seconds)
    const report = await validateStartup(idea);

    // Save validation scores
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

    // Save report
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

    return c.json({
      id: validation.id,
      ideaId: validation.ideaId,
      score: report.score,
      status: "complete" as const,
      createdAt: validation.createdAt.toISOString(),
    }, 201);
  },

  /**
   * Get the status of a validation.
   *
   * GET /validations/:id
   * Auth: required
   */
  async status(c: Context) {
    const id = c.req.param("id");
    const userId = c.get("userId");

    const validation = await prisma.validation.findUnique({
      where: { id },
      include: { report: true },
    });

    if (!validation || validation.userId !== userId) {
      throw new NotFoundError("Validation");
    }

    return c.json({
      id: validation.id,
      ideaId: validation.ideaId,
      status: validation.status.toLowerCase(),
      score: validation.overallScore
        ? {
            overall: validation.overallScore,
            market: validation.marketScore,
            team: validation.teamScore,
            moat: validation.moatScore,
            monetization: validation.monetizationScore,
            traction: validation.tractionScore,
            risk: validation.riskScore,
          }
        : null,
      reportId: validation.report?.id ?? null,
      createdAt: validation.createdAt.toISOString(),
    });
  },
};
