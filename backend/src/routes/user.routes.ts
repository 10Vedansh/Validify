import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { userController } from "@/controllers/user.controller";
import { requireAuth } from "@/middleware/auth.middleware";
import { updateUserSchema } from "@/schemas/user.schema";

const router = new Hono();

router.use("*", requireAuth);

router.patch("/me", zValidator("json", updateUserSchema), userController.update);

export { router as userRoutes };
