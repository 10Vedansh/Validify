import { analyzeMarket } from "@/services/ai/market-research.service";
import { analyzeCompetitors } from "@/services/ai/competitor.service";
import { analyzePersonas } from "@/services/ai/persona.service";
import { analyzeSWOT } from "@/services/ai/swot.service";
import { analyzeRisks } from "@/services/ai/risk-analysis.service";
import { analyzeRevenueModel } from "@/services/ai/revenue-model.service";
import { calculateScores } from "@/services/ai/validation-score.service";
import { complete, parseJSON } from "@/lib/gemini";
import { promptBuilder } from "@/utils/prompt-builder";
import type { ValidationReport, ServiceResult } from "@/types/ai";
import type { Idea } from "@prisma/client";

/**
 * Master orchestrator for startup validation.
 *
 * Runs 7 AI analysis services in parallel with configurable concurrency,
 * collects results with graceful degradation, generates the executive
 * summary and roadmap, and assembles the final ValidationReport.
 *
 * The report maps directly to the frontend `Report` type at
 * validifyai-main/src/types/report.ts.
 */

// ─── Concurrency control ──────────────────────────────────────────────

async function runAll<T extends Record<string, () => Promise<unknown>>>(
  tasks: T,
): Promise<{ [K in keyof T]: ServiceResult<Awaited<ReturnType<T[K]>>> }> {
  const entries = Object.entries(tasks) as [string, () => Promise<unknown>][];
  const results = await Promise.allSettled(
    entries.map(async ([key, fn]) => {
      const result = await fn();
      return { key, result };
    }),
  );

  const output: Record<string, ServiceResult<unknown>> = {};
  for (let i = 0; i < entries.length; i++) {
    const key = entries[i][0];
    const settled = results[i];

    if (settled.status === "fulfilled") {
      output[key] = { success: true, data: settled.value.result };
    } else {
      const reason = settled.reason instanceof Error ? settled.reason.message : String(settled.reason);
      console.error(`[Orchestrator] Service "${key}" failed: ${reason}`);
      output[key] = { success: false, error: reason };
    }
  }

  return output as any;
}

// ─── Report assembly ──────────────────────────────────────────────────

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function defaultScore(): { overall: number; market: number; team: number; moat: number; monetization: number; traction: number; risk: number } {
  return { overall: 50, market: 50, team: 50, moat: 50, monetization: 50, traction: 50, risk: 50 };
}

function defaultSWOT(): { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] } {
  return { strengths: [], weaknesses: [], opportunities: [], threats: [] };
}

// ─── Public API ───────────────────────────────────────────────────────

export async function validateStartup(
  idea: Idea,
  onProgress?: (service: string, status: "running" | "done" | "failed") => void,
): Promise<ValidationReport> {
  // ─── Phase 1: Run all 7 analyses in parallel ─────────────────────
  onProgress?.("scores", "running");
  onProgress?.("market", "running");
  onProgress?.("competitors", "running");
  onProgress?.("personas", "running");
  onProgress?.("swot", "running");
  onProgress?.("risks", "running");
  onProgress?.("revenue", "running");

  const results = await runAll({
    scores: () => calculateScores(idea),
    market: () => analyzeMarket(idea),
    competitors: () => analyzeCompetitors(idea),
    personas: () => analyzePersonas(idea),
    swot: () => analyzeSWOT(idea),
    risks: () => analyzeRisks(idea),
    revenue: () => analyzeRevenueModel(idea),
  });

  // Track completion
  for (const [key, result] of Object.entries(results)) {
    onProgress?.(key, result.success ? "done" : "failed");
  }

  // ─── Extract results with fallbacks ──────────────────────────────
  const scores = results.scores.success
    ? results.scores.data
    : defaultScore();

  const swot = results.swot.success
    ? results.swot.data
    : defaultSWOT();

  const competitors = results.competitors.success
    ? results.competitors.data.competitors.map((c: { name: string; score: number; url?: string }) => ({
        name: c.name,
        score: clampScore(c.score),
        url: c.url,
      }))
    : [];

  const market = results.market.success ? results.market.data : null;
  const personas = results.personas.success ? results.personas.data : null;
  const risks = results.risks.success ? results.risks.data : null;
  const revenue = results.revenue.success ? results.revenue.data : null;

  // ─── Phase 2: Generate executive summary ─────────────────────────
  let summary = "";
  try {
    const { system, user } = promptBuilder.executiveSummary(
      idea,
      { overall: scores.overall ?? 50, market: scores.market ?? 50, monetization: scores.monetization ?? 50 },
      swot.strengths,
      scores.risk ?? 50,
    );
    const { content } = await complete([
      { role: "system", content: system },
      { role: "user", content: user },
    ], { temperature: 0.4 });
    const parsed = parseJSON<{ summary: string }>(content);
    summary = parsed.summary;
  } catch (error) {
    console.error("[Orchestrator] Summary generation failed:", error);
    const industryDisplay = ({ AI_ML: "AI / ML", FINTECH: "Fintech", HEALTHTECH: "Healthtech", CLIMATE: "Climate", DEVTOOLS: "DevTools", CONSUMER: "Consumer", PRODUCTIVITY: "Productivity" } as Record<string, string>)[idea.industry] ?? idea.industry;
    summary = `${idea.name} addresses a problem in the ${industryDisplay} space targeting ${idea.audience}. The validation scored ${scores.overall ?? 50}/100 overall, with the strongest signals in market opportunity (${scores.market ?? 50}/100) and monetization potential (${scores.monetization ?? 50}/100). Key strengths include ${(swot.strengths?.slice(0, 2) ?? []).join(" and ") || "a clear problem-solution fit"}.`;
  }

  // ─── Phase 3: Generate roadmap ───────────────────────────────────
  let roadmap: { quarter: string; label: string }[] = [];
  try {
    const riskLevel = risks?.overallRiskLevel ?? "medium";
    const { system, user } = promptBuilder.roadmap(idea, riskLevel);
    const { content } = await complete([
      { role: "system", content: system },
      { role: "user", content: user },
    ], { temperature: 0.3 });
    const parsed = parseJSON<{ roadmap: { quarter: string; label: string }[] }>(content);
    roadmap = parsed.roadmap;
  } catch (error) {
    console.error("[Orchestrator] Roadmap generation failed:", error);
    roadmap = [
      { quarter: "Q1", label: "MVP launch with core features" },
      { quarter: "Q2", label: "Customer validation and iteration" },
      { quarter: "Q3", label: "Scale acquisition and team building" },
      { quarter: "Q4", label: "Expand to adjacent segments" },
    ];
  }

  // ─── Assemble final report ───────────────────────────────────────
  const report: ValidationReport = {
    score: {
      overall: clampScore(scores.overall ?? 50),
      market: clampScore(scores.market ?? 50),
      team: clampScore(scores.team ?? 50),
      moat: clampScore(scores.moat ?? 50),
      monetization: clampScore(scores.monetization ?? 50),
      traction: clampScore(scores.traction ?? 50),
      risk: clampScore(scores.risk ?? 50),
    },
    swot: {
      strengths: swot.strengths ?? [],
      weaknesses: swot.weaknesses ?? [],
      opportunities: swot.opportunities ?? [],
      threats: swot.threats ?? [],
    },
    competitors,
    roadmap,
    summary,
    marketResearch: market ?? {
      tam: "Unable to estimate",
      sam: "Unable to estimate",
      som: "Unable to estimate",
      marketGrowthRate: "Unknown",
      trendSignals: [],
      industryAnalysis: "Market research data unavailable.",
    },
    revenueModel: revenue ?? {
      recommendedModel: idea.businessModel,
      rationale: "Revenue model analysis unavailable.",
      projectedArpu: "N/A",
      projectedMrr: "N/A",
      breakevenMonth: 18,
      pricingTiers: [
        { name: "Basic", price: "TBD", features: ["Core features"] },
        { name: "Pro", price: "TBD", features: ["Advanced features"] },
        { name: "Enterprise", price: "Custom", features: ["Custom features"] },
      ],
    },
    riskAnalysis: risks ?? {
      risks: [],
      overallRiskLevel: "medium",
    },
    persona: personas ?? {
      icp: idea.audience,
      segments: [],
      painPoints: [],
    },
  };

  return report;
}
