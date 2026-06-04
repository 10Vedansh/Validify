/**
 * AI engine types.
 *
 * Each analysis service returns one of these structured types.
 * The orchestrator combines them into the final Report shape
 * that matches the frontend exactly.
 */

// ─── Per-service output types ─────────────────────────────────────────

export interface MarketResearchOutput {
  tam: string;
  sam: string;
  som: string;
  marketGrowthRate: string;
  trendSignals: string[];
  industryAnalysis: string;
}

export interface CompetitorOutput {
  competitors: {
    name: string;
    score: number;
    url?: string;
    strengths?: string[];
    weaknesses?: string[];
  }[];
}

export interface PersonaOutput {
  icp: string;
  segments: { name: string; description: string; willingnessToPay: string }[];
  painPoints: string[];
}

export interface SWOTOutput {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface RiskAnalysisOutput {
  risks: { category: string; severity: "low" | "medium" | "high"; description: string; mitigation: string }[];
  overallRiskLevel: "low" | "medium" | "high";
}

export interface RevenueModelOutput {
  recommendedModel: string;
  rationale: string;
  projectedArpu: string;
  projectedMrr: string;
  breakevenMonth: number;
  pricingTiers: { name: string; price: string; features: string[] }[];
}

export interface ValidationScoreOutput {
  overall: number;
  market: number;
  team: number;
  moat: number;
  monetization: number;
  traction: number;
  risk: number;
}

// ─── Orchestrator output ──────────────────────────────────────────────

export interface ValidationReport {
  score: ValidationScoreOutput;
  swot: SWOTOutput;
  competitors: { name: string; score: number; url?: string }[];
  roadmap: { quarter: string; label: string }[];
  summary: string;
  marketResearch: MarketResearchOutput;
  revenueModel: RevenueModelOutput;
  riskAnalysis: RiskAnalysisOutput;
  persona: PersonaOutput;
}

// ─── Service error wrapper ────────────────────────────────────────────

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
