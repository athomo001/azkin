import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { validateBody } from "../middlewares/validate";
import { createViewerSchema, updateViewerPermissionsSchema } from "../schemas/user.schema";

export function userRoutes(controller: UserController): Router {
  const router = Router();
  router.get("/", asyncHandler(controller.list));
  router.post("/", validateBody(createViewerSchema), asyncHandler(controller.create));
  // Rutas de perfil propio
  router.put("/profile/password", asyncHandler(controller.changeOwnPassword));
  router.put("/preferences", asyncHandler(controller.updatePreferences));
  // Rutas de gestión de viewers (admin sobre sus propios viewers)
  router.put("/:id/password", asyncHandler(controller.changeViewerPassword));
  router.put("/:id/permissions", validateBody(updateViewerPermissionsSchema), asyncHandler(controller.updatePermissions));
  router.delete("/:id", asyncHandler(controller.remove));
  return router;
}
