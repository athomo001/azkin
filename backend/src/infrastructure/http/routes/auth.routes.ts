// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { validateBody } from "../middlewares/validate";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../schemas/auth.schema";

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  router.post("/register", validateBody(registerSchema), asyncHandler(controller.register));
  router.post("/login", validateBody(loginSchema), asyncHandler(controller.login));
  router.get("/bootstrap-status", asyncHandler(controller.bootstrapStatus));
  router.post("/forgot-password", validateBody(forgotPasswordSchema), asyncHandler(controller.forgotPassword));
  router.post("/reset-password", validateBody(resetPasswordSchema), asyncHandler(controller.resetPassword));
  return router;
}
