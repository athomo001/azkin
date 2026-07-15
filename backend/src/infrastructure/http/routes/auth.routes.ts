import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { validateBody } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  router.post("/register", validateBody(registerSchema), asyncHandler(controller.register));
  router.post("/login", validateBody(loginSchema), asyncHandler(controller.login));
  return router;
}
