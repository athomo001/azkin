// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { RequestHandler, Router } from "express";
import { FederationController } from "../controllers/federation.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";
import { validateBody } from "../middlewares/validate";
import { makeAuthRateLimiter } from "../middlewares/rate-limit";
import { acceptEnrollmentSchema, createEnrollmentTokenSchema, joinFederationSchema } from "../schemas/federation.schema";

/**
 * `/tokens` e `/instances` son administración (requieren sesión de Admin, como el resto de
 * `/settings`). `/enrollments` es la única ruta pública de este router: la llama el backend de
 * la instancia remota que se está enrolando, nunca un usuario con sesión de esta instancia — su
 * única prueba de autorización es el token de un solo uso (mismo nivel de protección que
 * `/auth/reset-password`, con el mismo rate limiter anti fuerza-bruta).
 */
export function federationRoutes(controller: FederationController, authGuard: RequestHandler): Router {
  const router = Router();
  const enrollmentLimiter = makeAuthRateLimiter(10, 15);

  router.post("/tokens", authGuard, requireRole("admin"), validateBody(createEnrollmentTokenSchema), asyncHandler(controller.createToken));
  router.post("/instances", authGuard, requireRole("admin"), validateBody(joinFederationSchema), asyncHandler(controller.join));
  router.get("/instances", authGuard, requireRole("admin"), asyncHandler(controller.list));
  router.delete("/instances/:id", authGuard, requireRole("admin"), asyncHandler(controller.revoke));
  router.post("/enrollments", enrollmentLimiter, validateBody(acceptEnrollmentSchema), asyncHandler(controller.accept));

  return router;
}
