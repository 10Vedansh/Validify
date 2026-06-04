import type { Context } from "hono";
import { ideasService } from "@/services/ideas.service";
import type { CreateIdeaInput } from "@/schemas/idea.schema";

export const ideasController = {
  async list(c: Context) {
    const userId = c.get("userId");
    const ideas = await ideasService.list(userId);
    return c.json(ideas);
  },

  async create(c: Context) {
    const userId = c.get("userId");
    const body = c.req.valid("json" as never) as CreateIdeaInput;
    const idea = await ideasService.create(userId, body);
    return c.json(idea, 201);
  },
};
