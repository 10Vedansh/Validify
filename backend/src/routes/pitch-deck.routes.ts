import { Hono } from "hono";
import { pitchDeckController } from "@/controllers/pitch-deck.controller";
import { requireAuth } from "@/middleware/auth.middleware";

const router = new Hono();

router.use("*", requireAuth);

router.get("/", pitchDeckController.list);
router.post("/generate/:reportId", pitchDeckController.generate);
router.post("/regenerate/:reportId", pitchDeckController.regenerate);
router.get("/:id", pitchDeckController.getById);
router.delete("/:id", pitchDeckController.delete);

export { router as pitchDeckRoutes };
