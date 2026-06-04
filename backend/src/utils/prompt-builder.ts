import type { Idea } from "@prisma/client";

/**
 * Prompt builder for all AI analysis services.
 *
 * Each method returns a pair of system + user messages for the LLM.
 * All prompts request JSON output matching the expected interface.
 */

function formatIdeaContext(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel"> & Partial<Pick<Idea, "budget" | "country" | "competitors" | "notes">>): string {
  return `
Startup name: ${idea.name}
Industry: ${idea.industry}
Problem: ${idea.problem}
Target audience: ${idea.audience}
Business model: ${idea.businessModel}
Budget: ${idea.budget ?? "Not specified"}
Country: ${idea.country ?? "Not specified"}
Competitors mentioned: ${(idea.competitors?.length ?? 0) > 0 ? idea.competitors!.join(", ") : "None provided"}
Additional notes: ${idea.notes ?? "None"}
`.trim();
}

export const promptBuilder = {
  marketResearch(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "budget" | "country">) {
    return {
      system: `You are a world-class market research analyst at a top VC firm. Given a startup idea, estimate the market size and provide trend analysis.

Respond ONLY with valid JSON in this exact format:
{
  "tam": "string — total addressable market in USD",
  "sam": "string — serviceable addressable market in USD",
  "som": "string — serviceable obtainable market in USD",
  "marketGrowthRate": "string — e.g. '14% CAGR'",
  "trendSignals": ["string — 3-5 market trend signals"],
  "industryAnalysis": "string — 2-3 sentence analysis of industry dynamics"
}`,
      user: formatIdeaContext(idea),
    };
  },

  competitorAnalysis(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "competitors">) {
    return {
      system: `You are a competitive intelligence analyst. Identify and evaluate competitors for this startup idea.

Respond ONLY with valid JSON in this exact format:
{
  "competitors": [
    {
      "name": "string — competitor name",
      "score": number — 0-100 overall competitiveness score,
      "url": "string — website URL (optional)",
      "strengths": ["string — 2-3 key strengths"],
      "weaknesses": ["string — 2-3 key weaknesses"]
    }
  ]
}

Include 4-6 competitors ranging from direct to lateral substitutes. Score the target startup as 'You' in the list.`,
      user: formatIdeaContext(idea),
    };
  },

  personaAnalysis(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "country">) {
    return {
      system: `You are a user research expert. Define the ideal customer profile for this startup idea.

Respond ONLY with valid JSON in this exact format:
{
  "icp": "string — concise ideal customer profile description",
  "segments": [
    {
      "name": "string — segment name",
      "description": "string — segment description",
      "willingnessToPay": "string — e.g. '$50-100/mo'"
    }
  ],
  "painPoints": ["string — 3-5 specific pain points this idea addresses"]
}`,
      user: formatIdeaContext(idea),
    };
  },

  swotAnalysis(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "competitors">) {
    return {
      system: `You are a business strategy consultant. Perform a SWOT analysis for this startup idea.

Respond ONLY with valid JSON in this exact format:
{
  "strengths": ["string — 3-5 internal strengths"],
  "weaknesses": ["string — 3-5 internal weaknesses"],
  "opportunities": ["string — 3-5 external opportunities"],
  "threats": ["string — 3-5 external threats"]
}`,
      user: formatIdeaContext(idea),
    };
  },

  riskAnalysis(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "budget" | "country">) {
    return {
      system: `You are a risk assessment specialist. Evaluate the risks for this startup idea.

Respond ONLY with valid JSON in this exact format:
{
  "risks": [
    {
      "category": "string — e.g. 'Technical', 'Market', 'Regulatory', 'Team', 'Financial'",
      "severity": "low" | "medium" | "high",
      "description": "string — specific risk description",
      "mitigation": "string — actionable mitigation strategy"
    }
  ],
  "overallRiskLevel": "low" | "medium" | "high"
}

Include 5-7 distinct risks covering different categories.`,
      user: formatIdeaContext(idea),
    };
  },

  revenueModel(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "budget">) {
    return {
      system: `You are a startup financial analyst. Recommend a revenue model and pricing strategy.

Respond ONLY with valid JSON in this exact format:
{
  "recommendedModel": "string — e.g. 'Hybrid seat + usage-based pricing'",
  "rationale": "string — 2-3 sentence explanation",
  "projectedArpu": "string — average revenue per user projection",
  "projectedMrr": "string — month 12 MRR projection",
  "breakevenMonth": number — estimated month to breakeven,
  "pricingTiers": [
    {
      "name": "string — tier name",
      "price": "string — e.g. '$29/mo'",
      "features": ["string — key features in this tier"]
    }
  ]
}

Provide 3 pricing tiers.`,
      user: formatIdeaContext(idea),
    };
  },

  validationScores(idea: Pick<Idea, "name" | "industry" | "problem" | "audience" | "businessModel" | "budget" | "country" | "competitors" | "notes">) {
    return {
      system: `You are a venture capital analyst scoring early-stage startup ideas. Rate this idea across 7 dimensions.

CRITICAL: Each dimension must be a score from 0 to 100. Use the full range — most startups score between 40 and 85. Only exceptional ideas get above 90.

Scoring guidelines:
- market: Size, growth rate, urgency of problem (0-100)
- team: Founder-market fit implied by the idea details (0-100)
- moat: Defensibility, IP, network effects, data moat (0-100)
- monetization: Pricing model clarity, willingness-to-pay, margins (0-100)
- traction: Evidence of demand, existing users, revenue (0-100)
- risk: Inverted — lower score = higher risk (0-100, where 100 = no risk)

Respond ONLY with valid JSON in this exact format:
{
  "overall": number — weighted average of all dimensions (0-100),
  "market": number (0-100),
  "team": number (0-100),
  "moat": number (0-100),
  "monetization": number (0-100),
  "traction": number (0-100),
  "risk": number (0-100, lower = more risky)
}`,
      user: formatIdeaContext(idea),
    };
  },

  /**
   * Executive summary generation — called by the orchestrator after
   * all analysis services have completed.
   */
  executiveSummary(idea: Pick<Idea, "name" | "problem" | "audience">, scores: {
    overall: number;
    market: number;
    monetization: number;
  }, strengths: string[], risks: number) {
    return {
      system: `You are an expert at writing concise startup investment summaries. Write a 3-4 sentence executive summary.

Respond ONLY with valid JSON in this exact format:
{
  "summary": "string — 3-4 sentence executive summary covering the idea, market opportunity, key findings, and recommendations"
}`,
      user: `
Startup: ${idea.name}
Problem: ${idea.problem}
Audience: ${idea.audience}
Overall Score: ${scores.overall}/100
Market Score: ${scores.market}/100
Monetization Score: ${scores.monetization}/100
Key Strengths: ${strengths.slice(0, 3).join(", ")}
Risk Level: ${risks >= 70 ? "Low" : risks >= 50 ? "Medium" : "High"}
`.trim(),
    };
  },

  /**
   * Roadmap generation — called by the orchestrator after all analysis
   * services have completed.
   */
  roadmap(idea: Pick<Idea, "name" | "industry" | "businessModel">, riskLevel: string) {
    return {
      system: `You are a product strategist. Generate a 4-quarter product and business roadmap for this startup.

Respond ONLY with valid JSON in this exact format:
{
  "roadmap": [
    { "quarter": "string — e.g. 'Q1'", "label": "string — key milestone" },
    { "quarter": "string — e.g. 'Q2'", "label": "string — key milestone" },
    { "quarter": "string — e.g. 'Q3'", "label": "string — key milestone" },
    { "quarter": "string — e.g. 'Q4'", "label": "string — key milestone" }
  ]
}

Focus on milestones that address the key risks and leverage the market opportunity.`,
      user: `Startup: ${idea.name}\nIndustry: ${idea.industry}\nBusiness Model: ${idea.businessModel}\nRisk Level: ${riskLevel}`,
    };
  },
};
