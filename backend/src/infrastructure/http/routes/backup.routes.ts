import { Router } from "express";
import { BackupController } from "../controllers/backup.controller";
import { asyncHandler } from "../middlewares/async-handler";

export function backupRoutes(controller: BackupController): Router {
  const router = Router();
  router.get("/export", asyncHandler(controller.export));
  router.post("/import", asyncHandler(controller.import));
  return router;
}
