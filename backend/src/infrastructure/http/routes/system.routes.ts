// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { SystemController } from "../controllers/system.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";
import { validateBody } from "../middlewares/validate";
import { monitoringEngineSettingsSchema } from "../schemas/system.schema";

export function systemRoutes(controller: SystemController): Router {
  const router = Router();
  router.get("/smtp", requireRole("admin"), asyncHandler(controller.getSmtpStatus));
  router.post("/smtp/test", requireRole("admin"), asyncHandler(controller.sendTestEmail));
  router.get("/smtp/channel", requireRole("admin"), asyncHandler(controller.getAppSmtpChannel));
  router.put("/smtp/channel", requireRole("admin"), asyncHandler(controller.setAppSmtpChannel));
  router.get("/monitoring-settings", requireRole("admin"), asyncHandler(controller.getMonitoringEngineSettings));
  router.put(
    "/monitoring-settings",
    requireRole("admin"),
    validateBody(monitoringEngineSettingsSchema),
    asyncHandler(controller.setMonitoringEngineSettings),
  );
  return router;
}
