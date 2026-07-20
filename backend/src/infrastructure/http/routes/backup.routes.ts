// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { BackupController } from "../controllers/backup.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";

export function backupRoutes(controller: BackupController): Router {
  const router = Router();
  router.get("/", requireRole("admin"), asyncHandler(controller.list));
  router.post("/", requireRole("admin"), asyncHandler(controller.create));
  router.post("/import", requireRole("admin"), asyncHandler(controller.import));
  router.post("/purge", requireRole("admin"), asyncHandler(controller.purge));
  router.get("/purge-preview", requireRole("admin"), asyncHandler(controller.purgePreview));
  // Debe ir al final: "/:id" matchearía "/purge-preview" como si fuera un id si se registrara antes.
  router.get("/:id", requireRole("admin"), asyncHandler(controller.download));
  return router;
}
