// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";
import { validateBody } from "../middlewares/validate";
import { createNotificationSchema, updateNotificationSchema } from "../schemas/notification.schema";

export function notificationRoutes(controller: NotificationController): Router {
  const router = Router();
  router.get("/", requireRole("admin"), asyncHandler(controller.list));
  router.post("/", requireRole("admin"), validateBody(createNotificationSchema), asyncHandler(controller.create));
  router.put("/:id", requireRole("admin"), validateBody(updateNotificationSchema), asyncHandler(controller.update));
  router.delete("/:id", requireRole("admin"), asyncHandler(controller.remove));
  router.post("/:id/test", requireRole("admin"), asyncHandler(controller.test));
  return router;
}
