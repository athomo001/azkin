// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { SystemController } from "../controllers/system.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";
import { validateBody } from "../middlewares/validate";
import { applyTlsConfigSchema } from "../schemas/system.schema";

export function systemRoutes(controller: SystemController): Router {
  const router = Router();
  router.get("/tls", requireRole("admin"), asyncHandler(controller.getTlsConfig));
  router.put("/tls", requireRole("admin"), validateBody(applyTlsConfigSchema), asyncHandler(controller.applyTlsConfig));
  return router;
}
