// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { MonitorController } from "../controllers/monitor.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";
import { validateBody } from "../middlewares/validate";
import { createMonitorSchema, updateMonitorSchema } from "../schemas/monitor.schema";

export function monitorRoutes(controller: MonitorController): Router {
  const router = Router();
  router.get("/", asyncHandler(controller.list));
  router.get("/export", requireRole("admin"), asyncHandler(controller.exportAssets));
  router.post("/", requireRole("admin"), validateBody(createMonitorSchema), asyncHandler(controller.create));
  router.post("/bulk-delete", requireRole("admin"), asyncHandler(controller.bulkRemove));
  router.post("/bulk-import", requireRole("admin"), asyncHandler(controller.bulkImportCsv));
  router.post("/import-assets", requireRole("admin"), asyncHandler(controller.importAssets));
  router.put("/:id", requireRole("admin"), validateBody(updateMonitorSchema), asyncHandler(controller.update));
  router.delete("/:id", requireRole("admin"), asyncHandler(controller.remove));
  return router;
}
