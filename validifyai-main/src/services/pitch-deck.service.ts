import { api } from "@/lib/api";

export interface PitchDeckSlide {
  type:
    | "title"
    | "problem"
    | "solution"
    | "market"
    | "business_model"
    | "competition"
    | "traction"
    | "team"
    | "financials"
    | "ask";
  title: string;
  content: string;
  bullets?: string[];
}

export interface PitchDeck {
  id: string;
  reportId: string;
  title: string;
  content: PitchDeckSlide[];
  createdAt: string;
  updatedAt: string;
}

export const pitchDeckService = {
  async list(): Promise<PitchDeck[]> {
    const { data } = await api.get<PitchDeck[]>("/pitch-decks");
    return data;
  },

  async get(id: string): Promise<PitchDeck> {
    const { data } = await api.get<PitchDeck>(`/pitch-decks/${id}`);
    return data;
  },

  async generate(reportId: string): Promise<PitchDeck> {
    const { data } = await api.post<PitchDeck>(`/pitch-decks/generate/${reportId}`);
    return data;
  },

  async regenerate(reportId: string): Promise<PitchDeck> {
    const { data } = await api.post<PitchDeck>(`/pitch-decks/regenerate/${reportId}`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/pitch-decks/${id}`);
  },
};
