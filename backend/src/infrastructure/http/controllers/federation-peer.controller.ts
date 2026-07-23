// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { ListLocalMonitorsForPeerUseCase } from "../../../application/use-cases/federation/list-local-monitors-for-peer.usecase";
import { RespondToSyncRequestUseCase } from "../../../application/use-cases/federation/respond-to-sync-request.usecase";
import { ValidationError } from "../../../domain/errors/domain-error";

/**
 * Controller del listener mTLS de federación (AZ-049, slice 2) — nunca montado en la app
 * principal. Cada handler asume que `verifyPeerCertificate` ya corrió antes (adjunta
 * `req.federatedInstance`).
 */
export class FederationPeerController {
  constructor(
    private readonly listLocalMonitorsForPeerUseCase: ListLocalMonitorsForPeerUseCase,
    private readonly respondToSyncRequestUseCase: RespondToSyncRequestUseCase,
  ) {}

  monitors = async (_req: Request, res: Response): Promise<void> => {
    const monitors = await this.listLocalMonitorsForPeerUseCase.execute();
    res.status(200).json(monitors);
  };

  sync = async (req: Request, res: Response): Promise<void> => {
    const monitorId = typeof req.query.monitorId === "string" ? req.query.monitorId : "";
    if (!monitorId) {
      throw new ValidationError("Falta el parámetro monitorId");
    }
    const since = typeof req.query.since === "string" && req.query.since ? new Date(req.query.since) : null;
    const heartbeats = await this.respondToSyncRequestUseCase.execute(monitorId, since);
    res.status(200).json(heartbeats);
  };
}
