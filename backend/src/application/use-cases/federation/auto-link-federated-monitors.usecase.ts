// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { ListRemoteMonitorsUseCase } from "./list-remote-monitors.usecase";
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

export interface AutoLinkResult {
  linkedCount: number;
  links: IFederatedMonitorLink[];
}

/**
 * Caso de uso para auto-descubrir y vincular automáticamente los monitores de una instancia federada.
 * Compara los monitores locales con los del nodo remoto por Nombre o Dirección/Target (IP o URL).
 * Para cada coincidencia no vinculada previamente, genera el vínculo y gatilla la sincronización de datos.
 */
export class AutoLinkFederatedMonitorsUseCase {
  constructor(
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly links: IFederatedMonitorLinkRepository,
    private readonly monitors: IMonitorRepository,
    private readonly listRemoteMonitors: ListRemoteMonitorsUseCase,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, federatedInstanceId: string): Promise<AutoLinkResult> {
    const instance = await this.federatedInstances.findById(federatedInstanceId);
    if (!instance) {
      throw new NotFoundError("Instancia federada no encontrada");
    }
    if (instance.status !== "enrolled") {
      throw new ValidationError("La federación con esta instancia no está activa");
    }

    // Obtener los monitores del nodo remoto y los monitores locales
    const remoteMonitors = await this.listRemoteMonitors.execute(federatedInstanceId);
    const localMonitors = await this.monitors.findAll();
    const existingLinks = await this.links.findByFederatedInstanceId(federatedInstanceId);

    const createdLinks: IFederatedMonitorLink[] = [];

    for (const local of localMonitors) {
      // Buscar coincidencia por nombre exacto (case insensitive) o por target idéntico
      const match = remoteMonitors.find((remote) => {
        const nameMatch = local.name.trim().toLowerCase() === remote.name.trim().toLowerCase();
        const targetMatch = local.target.trim().toLowerCase() === remote.target.trim().toLowerCase();
        return nameMatch || targetMatch;
      });

      if (match) {
        // Verificar si ya existe un vínculo para este monitor local y remoto
        const alreadyLinked = existingLinks.some(
          (l) => l.localMonitorId === local.id && l.remoteMonitorId === match.id,
        );

        if (!alreadyLinked) {
          const link = await this.links.create({
            localMonitorId: local.id,
            federatedInstanceId,
            remoteMonitorId: match.id,
            remoteMonitorLabel: `${match.name} (${instance.label})`,
            createdById: actorId,
          });

          createdLinks.push(link);

          await this.auditLog.record({
            actorId,
            action: "FEDERATION_MONITOR_LINK_CREATED",
            targetType: "federated-monitor-link",
            targetIds: [link.id],
            metadata: { localMonitorId: local.id, federatedInstanceId, autoLinked: true },
          });
        }
      }
    }

    // Si se crearon vínculos nuevos y existe función de sincronización, disparar sync asíncrono
    if (createdLinks.length > 0 && this.triggerSync) {
      this.triggerSync().catch(() => {
        // Silenciar errores asíncronos en segundo plano
      });
    }

    return {
      linkedCount: createdLinks.length,
      links: createdLinks,
    };
  }

  private triggerSync?: () => Promise<void>;

  setSyncTrigger(fn: () => Promise<void>): void {
    this.triggerSync = fn;
  }
}
