// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { RequestHandler, Router } from "express";
import { FederationController } from "../controllers/federation.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { requireRole } from "../middlewares/require-role";
import { validateBody } from "../middlewares/validate";
import { makeAuthRateLimiter } from "../middlewares/rate-limit";
import {
  acceptEnrollmentSchema,
  createFederatedMonitorLinkSchema,
  joinFederationSchema,
  setFederationOwnUrlSchema,
  testAddressConnectionSchema,
} from "../schemas/federation.schema";

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

  router.post("/tokens", authGuard, requireRole("admin"), asyncHandler(controller.createToken));
  router.post("/instances", authGuard, requireRole("admin"), validateBody(joinFederationSchema), asyncHandler(controller.join));
  router.get("/instances", authGuard, requireRole("admin"), asyncHandler(controller.list));
  router.post("/instances/:id/approve", authGuard, requireRole("admin"), asyncHandler(controller.approveInstance));
  router.post("/instances/:id/revoke", authGuard, requireRole("admin"), asyncHandler(controller.revoke));
  router.post("/instances/:id/reactivate", authGuard, requireRole("admin"), asyncHandler(controller.reactivate));
  router.delete("/instances/:id", authGuard, requireRole("admin"), asyncHandler(controller.deleteInstance));
  router.post("/enrollments", enrollmentLimiter, validateBody(acceptEnrollmentSchema), asyncHandler(controller.accept));

  router.get("/own-url", authGuard, requireRole("admin"), asyncHandler(controller.getOwnUrl));
  router.put("/own-url", authGuard, requireRole("admin"), validateBody(setFederationOwnUrlSchema), asyncHandler(controller.setOwnUrl));
  router.post("/test-connection", authGuard, requireRole("admin"), validateBody(testAddressConnectionSchema), asyncHandler(controller.testConnection));
  router.post("/instances/:id/test-connection", authGuard, requireRole("admin"), asyncHandler(controller.testInstanceConnection));

  router.get("/instances/:id/remote-monitors", authGuard, requireRole("admin"), asyncHandler(controller.remoteMonitors));
  router.post("/instances/:id/auto-link", authGuard, requireRole("admin"), asyncHandler(controller.autoLinkMonitors));
  router.post("/links", authGuard, requireRole("admin"), validateBody(createFederatedMonitorLinkSchema), asyncHandler(controller.createLink));
  router.get("/links", authGuard, requireRole("admin"), asyncHandler(controller.listLinks));
  router.delete("/links/:id", authGuard, requireRole("admin"), asyncHandler(controller.deleteLink));
  // Sin requireRole("admin"): un Viewer con permiso sobre el monitor tambien debe poder ver la
  // comparacion Por region/Combinado (el use case aplica filterMonitorsByPermission internamente).
  router.get("/comparison/:monitorId", authGuard, asyncHandler(controller.comparison));

  return router;
}
