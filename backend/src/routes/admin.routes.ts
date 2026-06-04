import { Hono } from "hono";
import { adminController } from "@/controllers/admin.controller";
import { requireAuth } from "@/middleware/auth.middleware";
import { requireAdmin } from "@/middleware/admin.middleware";

const router = new Hono();

router.use("*", requireAuth, requireAdmin);

router.get("/users", adminController.listUsers);
router.get("/analytics", adminController.getAnalytics);

export { router as adminRoutes };
