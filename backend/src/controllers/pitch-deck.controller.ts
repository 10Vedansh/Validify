import type { Context } from "hono";
import { pitchDeckService } from "@/services/pitch-deck.service";
import { BadRequestError } from "@/lib/errors";

export const pitchDeckController = {
  async generate(c: Context) {
    const userId = c.get("userId") as string;
    const reportId = c.req.param("reportId");
    if (!reportId) throw new BadRequestError("reportId is required");
    const deck = await pitchDeckService.generate(reportId, userId);
    return c.json(deck, 201);
  },

  async list(c: Context) {
    const userId = c.get("userId") as string;
    const decks = await pitchDeckService.list(userId);
    return c.json(decks);
  },

  async getById(c: Context) {
    const deckId = c.req.param("id");
    const userId = c.get("userId") as string;
    if (!deckId) throw new BadRequestError("Deck ID is required");
    const deck = await pitchDeckService.getById(deckId, userId);
    return c.json(deck);
  },

  async regenerate(c: Context) {
    const userId = c.get("userId") as string;
    const reportId = c.req.param("reportId");
    if (!reportId) throw new BadRequestError("reportId is required");
    const deck = await pitchDeckService.generate(reportId, userId);
    return c.json(deck);
  },

  async delete(c: Context) {
    const deckId = c.req.param("id");
    const userId = c.get("userId") as string;
    if (!deckId) throw new BadRequestError("Deck ID is required");
    await pitchDeckService.delete(deckId, userId);
    return c.json({ message: "Pitch deck deleted successfully" });
  },
};
