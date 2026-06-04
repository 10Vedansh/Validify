export type Industry =
  | "AI / ML"
  | "Fintech"
  | "Healthtech"
  | "Climate"
  | "DevTools"
  | "Consumer"
  | "Productivity";

export type BusinessModel =
  | "SaaS"
  | "Marketplace"
  | "Transactional"
  | "Usage-based"
  | "Freemium";

export type Idea = {
  id: string;
  name: string;
  industry: Industry;
  problem: string;
  audience: string;
  businessModel: BusinessModel;
  budget?: string;
  country?: string;
  competitors?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type IdeaDraft = Omit<Idea, "id" | "createdAt" | "updatedAt">;

export type ValidationScore = {
  overall: number;
  market: number;
  team: number;
  moat: number;
  monetization: number;
  traction: number;
  risk: number;
};

export type Validation = {
  id: string;
  ideaId: string;
  score: ValidationScore;
  status: "draft" | "running" | "complete" | "failed";
  createdAt: string;
};
