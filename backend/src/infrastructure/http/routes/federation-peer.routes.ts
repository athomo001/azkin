// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, RequestHandler, Response, Router } from "express";
import { FederationPeerController } from "../controllers/federation-peer.controller";
import { asyncHandler } from "../middlewares/async-handler";

/**
 * Endpoints peer-to-peer (AZ-049) — corren sobre el mismo `app`/puerto que el resto de la API, no
 * un listener dedicado. Todas las rutas requieren `verifyPeerSecret` montado antes (adjunta
 * `req.federatedInstance` tras validar el header `X-Federation-Secret`).
 */
export function federationPeerRoutes(controller: FederationPeerController, verifyPeerSecret: RequestHandler): Router {
  const router = Router();
  router.use(verifyPeerSecret);
  router.get("/ping", (req: Request, res: Response) => {
    res.status(200).json({ ok: true, peerLabel: req.federatedInstance?.label ?? null });
  });
  router.get("/monitors", asyncHandler(controller.monitors));
  router.get("/sync", asyncHandler(controller.sync));
  router.post("/notify-revocation", asyncHandler(controller.notifyRevocation));
  return router;
}
