import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { validateBody } from "../middlewares/validate";
import { createNotificationSchema, updateNotificationSchema } from "../schemas/notification.schema";

export function notificationRoutes(controller: NotificationController): Router {
  const router = Router();
  router.get("/", asyncHandler(controller.list));
  router.post("/", validateBody(createNotificationSchema), asyncHandler(controller.create));
  router.put("/:id", validateBody(updateNotificationSchema), asyncHandler(controller.update));
  router.delete("/:id", asyncHandler(controller.remove));
  router.post("/:id/test", asyncHandler(controller.test));
  return router;
}
