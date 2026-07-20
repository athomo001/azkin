// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { validateBody } from "../middlewares/validate";
import { makeAuthRateLimiter } from "../middlewares/rate-limit";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../schemas/auth.schema";

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  // Throttling anti fuerza-bruta / anti-enumeración en los 4 endpoints de auth sensibles.
  const strictLimiter = makeAuthRateLimiter(10, 15);
  router.post("/register", strictLimiter, validateBody(registerSchema), asyncHandler(controller.register));
  router.post("/login", strictLimiter, validateBody(loginSchema), asyncHandler(controller.login));
  router.get("/bootstrap-status", asyncHandler(controller.bootstrapStatus));
  router.post("/forgot-password", strictLimiter, validateBody(forgotPasswordSchema), asyncHandler(controller.forgotPassword));
  router.post("/reset-password", strictLimiter, validateBody(resetPasswordSchema), asyncHandler(controller.resetPassword));
  // Renovación de sesión vía cookie HttpOnly de refresh; logout limpia esa cookie.
  router.post("/refresh", asyncHandler(controller.refresh));
  router.post("/logout", asyncHandler(controller.logout));
  return router;
}
