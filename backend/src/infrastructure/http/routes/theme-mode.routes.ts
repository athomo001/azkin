// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { ThemeModeController } from "../controllers/theme-mode.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";
import { validateBody } from "../middlewares/validate";
import { updateThemeModeSettingsSchema } from "../schemas/theme-mode.schema";

export function themeModeRoutes(controller: ThemeModeController): Router {
  const router = Router();
  // Cualquier usuario autenticado (montado con authGuard, sin requireRole) — ver composition-root.ts.
  router.get("/", asyncHandler(controller.list));
  router.get("/admin", requireRole("admin"), asyncHandler(controller.listAdmin));
  router.put(
    "/admin/settings",
    requireRole("admin"),
    validateBody(updateThemeModeSettingsSchema),
    asyncHandler(controller.updateSettings),
  );
  return router;
}
