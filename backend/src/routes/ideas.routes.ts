import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ideasController } from "@/controllers/ideas.controller";
import { requireAuth } from "@/middleware/auth.middleware";
import { createIdeaSchema } from "@/schemas/idea.schema";

const router = new Hono();

router.use("*", requireAuth);

router.get("/", ideasController.list);
router.post("/", zValidator("json", createIdeaSchema), ideasController.create);

export { router as ideaRoutes };
