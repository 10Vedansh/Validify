import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { chatController } from "@/controllers/chat.controller";
import { requireAuth } from "@/middleware/auth.middleware";
import { sendMessageSchema, createThreadSchema } from "@/schemas/chat.schema";

const router = new Hono();

router.use("*", requireAuth);

router.get("/threads", chatController.listThreads);
router.post("/threads", zValidator("json", createThreadSchema), chatController.createThread);
router.get("/threads/:id/messages", chatController.getMessages);
router.post("/threads/:id/messages", zValidator("json", sendMessageSchema), chatController.sendMessage);

export { router as chatRoutes };
