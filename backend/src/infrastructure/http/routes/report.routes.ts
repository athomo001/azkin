// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";
import { validateBody } from "../middlewares/validate";
import { createReportDefinitionSchema, updateReportDefinitionSchema } from "../schemas/report-definition.schema";

/**
 * Gestión de informes periódicos de disponibilidad (AZ-045): exclusiva de Admin, mismo criterio
 * que Mantenimiento — un Viewer no tiene acceso a ninguna parte de este módulo, ni de solo lectura.
 */
export function reportRoutes(controller: ReportController): Router {
  const router = Router();
  router.get("/", requireRole("admin"), asyncHandler(controller.list));
  router.post("/", requireRole("admin"), validateBody(createReportDefinitionSchema), asyncHandler(controller.create));
  router.put("/:id", requireRole("admin"), validateBody(updateReportDefinitionSchema), asyncHandler(controller.update));
  router.delete("/:id", requireRole("admin"), asyncHandler(controller.remove));
  router.post("/:id/send-test", requireRole("admin"), asyncHandler(controller.sendTest));
  router.get("/:id/pdf", requireRole("admin"), asyncHandler(controller.downloadPdf));
  return router;
}
