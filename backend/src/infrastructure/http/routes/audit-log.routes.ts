// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { AuditLogController } from "../controllers/audit-log.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";

export function auditLogRoutes(controller: AuditLogController): Router {
  const router = Router();
  router.get("/", requireRole("admin"), asyncHandler(controller.list));
  return router;
}
