import { Hono } from "hono";
import { validationController } from "@/controllers/validation.controller";
import { requireAuth } from "@/middleware/auth.middleware";

/**
 * Validation routes.
 *
 * POST /ideas/:id/validate   — Run AI validation on an idea
 * GET  /validations/:id      — Check validation status
 */

const router = new Hono();

router.post("/ideas/:id/validate", requireAuth, validationController.start);
router.get("/validations/:id", requireAuth, validationController.status);

export { router as validationRoutes };
