// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { validateBody } from "../middlewares/validate";
import { makeAuthRateLimiter } from "../middlewares/rate-limit";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../schemas/auth.schema";

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  // AZ-066: instancia propia de rate limiter por endpoint — antes una única instancia
  // compartida entre los 4 hacía que agotar el cupo en uno (ej. /login) bloqueara también a los
  // otros 3 para esa misma IP.
  router.post("/register", makeAuthRateLimiter(10, 15), validateBody(registerSchema), asyncHandler(controller.register));
  router.post("/login", makeAuthRateLimiter(10, 15), validateBody(loginSchema), asyncHandler(controller.login));
  router.get("/bootstrap-status", asyncHandler(controller.bootstrapStatus));
  router.post(
    "/forgot-password",
    makeAuthRateLimiter(10, 15),
    validateBody(forgotPasswordSchema),
    asyncHandler(controller.forgotPassword),
  );
  router.post(
    "/reset-password",
    makeAuthRateLimiter(10, 15),
    validateBody(resetPasswordSchema),
    asyncHandler(controller.resetPassword),
  );
  // Renovación de sesión vía cookie HttpOnly de refresh; logout limpia esa cookie.
  // AZ-055/066: antes sin ningún límite — un refresh token filtrado permitía martillar este
  // endpoint sin restricción. Cupo más amplio que login/reset porque el uso legítimo (refresco
  // silencioso de sesión) es más frecuente.
  router.post("/refresh", makeAuthRateLimiter(30, 15), asyncHandler(controller.refresh));
  router.post("/logout", asyncHandler(controller.logout));
  return router;
}
