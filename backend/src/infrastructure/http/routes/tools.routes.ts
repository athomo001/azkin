// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { ToolsController } from "../controllers/tools.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { validateBody } from "../middlewares/validate";
import { dnsLookupSchema, dnsReverseLookupSchema } from "../schemas/tools.schema";

// Sin requireRole: disponible para cualquier rol autenticado (Admin y Viewer), igual que /monitors.
export function toolsRoutes(controller: ToolsController): Router {
  const router = Router();
  router.post("/dns-lookup", validateBody(dnsLookupSchema), asyncHandler(controller.dnsLookup));
  router.post("/dns-reverse", validateBody(dnsReverseLookupSchema), asyncHandler(controller.dnsReverseLookup));
  return router;
}
