// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederationClient } from "../../ports/services/federation-client";
import { IRealtimePublisher } from "../../ports/services/realtime-publisher";
import { DeleteMonitorUseCase } from "../monitors/delete-monitor.usecase";
import { NotFoundError } from "../../../domain/errors/domain-error";
import { getErrorMessage } from "../../services/get-error-message";
import { logger } from "../../../infrastructure/logger";

/**
 * Caso de uso para eliminar permanentemente una instancia federada y sus vínculos de monitoreo
 * (AZ-050). También: (1) borra en cascada los monitores que se auto-importaron por causa de esta
 * federación (nunca los que el Admin ya tenía manualmente y solo coincidieron por nombre/target,
 * ver `importedFromFederatedInstanceId`), incluyendo cualquier otro vínculo que ese monitor tuviera
 * con OTRAS instancias federadas (topología de 3+ nodos: un monitor puede pertenecer al mismo grupo
 * de monitoreo equivalente con más de un par a la vez — si se borra el monitor, esos otros vínculos
 * quedarían apuntando a un id inexistente); y (2) avisa a ESE par remoto puntual para que TAMBIÉN
 * borre por completo su propia copia — no solo la revoque (ver
 * `HandlePeerFederationDeletedUseCase`, que ejecuta esta misma clase del lado receptor sin volver a
 * notificar, para no generar un ping-pong infinito). El resto de federaciones de esta instancia con
 * otros pares (nodo 3, nodo 4, ...) no se tocan, cada enrollment es independiente. Antes, borrar de
 * un lado solo revocaba al otro (dejaba una instancia "zombie": ni sondeaba ni se podía re-vincular
 * de verdad, y "Reactivar" no tenía ningún efecto útil porque el par ya no la reconocía) — ahora
 * borra por completo en ambos lados, simétrico.
 */
export class DeleteFederatedInstanceUseCase {
  constructor(
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly links: IFederatedMonitorLinkRepository,
    private readonly monitors: IMonitorRepository,
    private readonly deleteMonitor: DeleteMonitorUseCase,
    private readonly auditLog: IAuditLogRepository,
    private readonly client?: IFederationClient,
    private readonly decryptSecret?: (encrypted: string, key: string) => string,
    private readonly encryptionKey?: string,
    // Avisa por Socket.IO al Admin de ESTE lado cuando el borrado lo dispara un par remoto (ver
    // AZ-050): sin esto, la instancia/monitores desaparecen de la base pero la UI abierta no se
    // entera hasta F5.
    private readonly realtimePublisher?: IRealtimePublisher,
  ) {}

  async execute(actorId: string, instanceId: string): Promise<void> {
    const existing = await this.federatedInstances.findById(instanceId);
    if (!existing) {
      throw new NotFoundError("Instancia federada no encontrada");
    }

    // Borrar en cascada los monitores auto-importados por esta federación (no los manuales)
    const allMonitors = await this.monitors.findAll();
    const importedMonitorIds = allMonitors
      .filter((m) => m.importedFromFederatedInstanceId === instanceId)
      .map((m) => m.id);
    for (const monitorId of importedMonitorIds) {
      // Antes de borrar el monitor, limpiar cualquier vínculo que tenga con OTRAS instancias
      // federadas (nodo 3, nodo 4, ...): si no, quedan apuntando a un `localMonitorId` que ya no
      // existe — huérfanos silenciosos que ninguna UI vuelve a mostrar ni limpia.
      const otherLinks = await this.links.findByLocalMonitorId(monitorId);
      for (const otherLink of otherLinks) {
        await this.links.delete(otherLink.id);
      }
      await this.deleteMonitor.execute(actorId, monitorId);
    }

    // Limpiar automáticamente todos los vínculos de monitoreo asociados a esta instancia
    await this.links.deleteByFederatedInstanceId(instanceId);

    // Eliminar el registro permanente de la instancia
    await this.federatedInstances.delete(instanceId);

    // Avisar al par remoto para que TAMBIÉN borre por completo su propia copia (instancia,
    // vínculos y monitores auto-importados) — best-effort: si el par está caído justo ahora, el
    // borrado local ya se completó igual; el par queda con una entrada obsoleta que puede limpiar
    // manualmente con "Borrar" cuando vuelva a estar disponible.
    if (this.client && this.decryptSecret && this.encryptionKey && existing.remoteSecretEncrypted) {
      try {
        const secret = this.decryptSecret(existing.remoteSecretEncrypted, this.encryptionKey);
        this.client.notifyDeletion({ remoteUrl: existing.remoteUrl, secret }).catch((err) => {
          logger.error(`[Federation] No se pudo avisar la eliminación de la federación a "${existing.label}": ${getErrorMessage(err)}`);
        });
      } catch {
        // Ignorar fallos de descifrado al notificar al par
      }
    }

    // Avisar por Socket.IO a ESTE lado (relevante sobre todo cuando este método corre porque un
    // par remoto notificó su propio borrado — ver AZ-050, "sin F5").
    this.realtimePublisher?.publishFederationLinksUpdated(actorId);

    await this.auditLog.record({
      actorId,
      action: "FEDERATION_INSTANCE_DELETED",
      targetType: "federated-instance",
      targetIds: [instanceId],
      metadata: { importedMonitorsDeleted: importedMonitorIds.length },
    });
  }
}
