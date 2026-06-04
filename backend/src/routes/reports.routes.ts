import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { reportsController } from "@/controllers/reports.controller";
import { requireAuth } from "@/middleware/auth.middleware";
import { generateReportSchema } from "@/schemas/report.schema";

/**
 * Report routes.
 *
 * All routes require authentication.
 *
 * POST   /reports/generate   — Run AI validation, create report
 * GET    /reports            — List reports (paginated, filterable)
 * GET    /reports/:id        — Get single report
 * DELETE /reports/:id        — Delete report
 */

const router = new Hono();

// All routes require auth
router.use("*", requireAuth);

router.post("/generate", zValidator("json", generateReportSchema), reportsController.generate);
router.get("/", reportsController.list);
router.get("/:id", reportsController.getById);
router.get("/:id/export.pdf", reportsController.exportPdf);
router.delete("/:id", reportsController.delete);

export { router as reportRoutes };
