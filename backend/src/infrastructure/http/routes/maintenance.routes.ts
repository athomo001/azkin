// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { MaintenanceController } from "../controllers/maintenance.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";
import { validateBody } from "../middlewares/validate";
import { createMaintenanceWindowSchema, updateMaintenanceWindowSchema } from "../schemas/maintenance.schema";

/**
 * Gestión de ventanas de mantenimiento: administración exclusiva de Admins (mismo criterio
 * que canales de notificación/backups). Los Viewers ven el efecto (badge "En mantenimiento"
 * en sus monitores autorizados) a través de los endpoints de monitores/stats que ya consultan,
 * no de este módulo de gestión.
 */
export function maintenanceRoutes(controller: MaintenanceController): Router {
  const router = Router();
  router.get("/", requireRole("admin"), asyncHandler(controller.list));
  router.post("/", requireRole("admin"), validateBody(createMaintenanceWindowSchema), asyncHandler(controller.create));
  router.put("/:id", requireRole("admin"), validateBody(updateMaintenanceWindowSchema), asyncHandler(controller.update));
  router.post("/:id/end", requireRole("admin"), asyncHandler(controller.end));
  router.delete("/:id", requireRole("admin"), asyncHandler(controller.remove));
  return router;
}
