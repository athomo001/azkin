// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { ApiKeyController } from "../controllers/api-key.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";
import { validateBody } from "../middlewares/validate";
import { createApiKeySchema } from "../schemas/api-key.schema";

export function apiKeyRoutes(controller: ApiKeyController): Router {
  const router = Router();
  router.post("/", requireRole("admin"), validateBody(createApiKeySchema), asyncHandler(controller.create));
  router.get("/", requireRole("admin"), asyncHandler(controller.list));
  router.delete("/:id", requireRole("admin"), asyncHandler(controller.revoke));
  return router;
}
