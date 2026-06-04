import type { ValidationScore } from "./startup";

export type SWOT = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

export type Competitor = {
  name: string;
  score: number;
  url?: string;
};

export type RoadmapItem = { quarter: string; label: string };

export type Report = {
  id: string;
  ideaId: string;
  title: string;
  summary: string;
  industry: string;
  score: ValidationScore;
  swot: SWOT;
  competitors: Competitor[];
  roadmap: RoadmapItem[];
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: string;
  messages?: ChatMessage[];
};
