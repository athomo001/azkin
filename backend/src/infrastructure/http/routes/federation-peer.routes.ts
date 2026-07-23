// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, RequestHandler, Response, Router } from "express";
import { FederationPeerController } from "../controllers/federation-peer.controller";
import { asyncHandler } from "../middlewares/async-handler";

/**
 * Endpoints peer-to-peer del listener mTLS dedicado (AZ-049, slice 2) — nunca la app principal.
 * Todas las rutas requieren `verifyPeerCertificate` montado antes (adjunta `req.federatedInstance`).
 */
export function federationPeerRoutes(controller: FederationPeerController, verifyPeerCertificate: RequestHandler): Router {
  const router = Router();
  router.use(verifyPeerCertificate);
  router.get("/ping", (req: Request, res: Response) => {
    res.status(200).json({ ok: true, peerLabel: req.federatedInstance?.label ?? null });
  });
  router.get("/monitors", asyncHandler(controller.monitors));
  router.get("/sync", asyncHandler(controller.sync));
  return router;
}
