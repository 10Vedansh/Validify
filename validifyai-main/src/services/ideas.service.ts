import { api } from "@/lib/api";
import type { Idea, IdeaDraft, Validation } from "@/types/startup";

export const ideasService = {
  async list(): Promise<Idea[]> {
    const { data } = await api.get<Idea[]>("/ideas");
    return data;
  },

  async create(draft: IdeaDraft): Promise<Idea> {
    const { data } = await api.post<Idea>("/ideas", draft);
    return data;
  },

  async validate(ideaId: string): Promise<Validation> {
    const { data } = await api.post<Validation>(`/ideas/${ideaId}/validate`);
    return data;
  },
};
