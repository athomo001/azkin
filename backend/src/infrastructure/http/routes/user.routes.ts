// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";
import { validateBody } from "../middlewares/validate";
import { createAdminSchema, createViewerSchema, updateViewerPermissionsSchema } from "../schemas/user.schema";

export function userRoutes(controller: UserController): Router {
  const router = Router();
  router.get("/", requireRole("admin"), asyncHandler(controller.list));
  router.post("/", requireRole("admin"), validateBody(createViewerSchema), asyncHandler(controller.create));
  router.post("/admins", requireRole("admin"), validateBody(createAdminSchema), asyncHandler(controller.createAdmin));
  router.get("/admins", requireRole("admin"), asyncHandler(controller.listAdmins));
  // Rutas de perfil propio (accesibles para cualquier rol autenticado)
  router.put("/profile/password", asyncHandler(controller.changeOwnPassword));
  router.put("/preferences", asyncHandler(controller.updatePreferences));
  // Rutas de gestión de viewers (admin sobre sus propios viewers)
  router.put("/:id/password", requireRole("admin"), asyncHandler(controller.changeViewerPassword));
  router.put(
    "/:id/permissions",
    requireRole("admin"),
    validateBody(updateViewerPermissionsSchema),
    asyncHandler(controller.updatePermissions),
  );
  router.delete("/:id", requireRole("admin"), asyncHandler(controller.remove));
  return router;
}
