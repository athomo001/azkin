// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { BackupController } from "../controllers/backup.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";

export function backupRoutes(controller: BackupController): Router {
  const router = Router();
  router.get("/", requireRole("admin"), asyncHandler(controller.list));
  router.post("/", requireRole("admin"), asyncHandler(controller.create));
  router.get("/:id", requireRole("admin"), asyncHandler(controller.download));
  router.post("/import", requireRole("admin"), asyncHandler(controller.import));
  return router;
}
