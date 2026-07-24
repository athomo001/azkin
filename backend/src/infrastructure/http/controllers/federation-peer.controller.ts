// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { ListLocalMonitorsForPeerUseCase } from "../../../application/use-cases/federation/list-local-monitors-for-peer.usecase";
import { RespondToSyncRequestUseCase } from "../../../application/use-cases/federation/respond-to-sync-request.usecase";
import { RegisterPeerMonitorLinkUseCase } from "../../../application/use-cases/federation/register-peer-monitor-link.usecase";
import { DeleteFederatedInstanceUseCase } from "../../../application/use-cases/federation/delete-federated-instance.usecase";
import { ValidationError } from "../../../domain/errors/domain-error";
import { logger } from "../../logger";
import { getErrorMessage } from "../../../application/services/get-error-message";

import { IFederatedInstanceRepository } from "../../../application/ports/repositories/federated-instance-repository";

/**
 * Controller de endpoints peer-to-peer de federación (AZ-049 / AZ-050). Cada handler asume que
 * `verifyPeerSecret` ya corrió antes (adjunta `req.federatedInstance`).
 */
export class FederationPeerController {
  constructor(
    private readonly listLocalMonitorsForPeerUseCase: ListLocalMonitorsForPeerUseCase,
    private readonly respondToSyncRequestUseCase: RespondToSyncRequestUseCase,
    private readonly federatedInstancesRepository?: IFederatedInstanceRepository,
    private readonly registerPeerMonitorLinkUseCase?: RegisterPeerMonitorLinkUseCase,
    // Misma clase que usa el borrado iniciado por el propio Admin, pero instanciada SIN cliente de
    // federación (ver composition-root) — así ejecuta la cascada local (instancia + vínculos +
    // monitores auto-importados) sin volver a notificar al par, evitando un ping-pong infinito.
    private readonly handlePeerFederationDeletedUseCase?: DeleteFederatedInstanceUseCase,
  ) {}

  monitors = async (_req: Request, res: Response): Promise<void> => {
    const monitors = await this.listLocalMonitorsForPeerUseCase.execute();
    res.status(200).json(monitors);
  };

  registerLink = async (req: Request, res: Response): Promise<void> => {
    if (!req.federatedInstance || !this.registerPeerMonitorLinkUseCase) {
      throw new ValidationError("No se pudo registrar el vínculo recíproco");
    }
    const link = await this.registerPeerMonitorLinkUseCase.execute(req.federatedInstance, {
      localMonitorId: req.body.localMonitorId,
      remoteMonitorId: req.body.remoteMonitorId,
      remoteMonitorName: req.body.remoteMonitorName,
    });
    res.status(201).json({ id: link.id });
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

  notifyRevocation = async (req: Request, res: Response): Promise<void> => {
    if (req.federatedInstance && this.federatedInstancesRepository) {
      await this.federatedInstancesRepository.revoke(req.federatedInstance.id);
    }
    res.status(200).json({ ok: true, message: "Revocación registrada" });
  };

  notifyDeletion = async (req: Request, res: Response): Promise<void> => {
    if (req.federatedInstance && this.handlePeerFederationDeletedUseCase) {
      try {
        await this.handlePeerFederationDeletedUseCase.execute(
          req.federatedInstance.createdById,
          req.federatedInstance.id,
        );
      } catch (err) {
        // No dejar que un fallo acá tumbe la respuesta al par: su propio borrado ya se completó
        // de su lado igual, y esto solo limpia la copia local.
        logger.error(`[Federation] Fallo al procesar el aviso de eliminación de "${req.federatedInstance.label}": ${getErrorMessage(err)}`);
      }
    }
    res.status(200).json({ ok: true, message: "Eliminación registrada" });
  };
}
