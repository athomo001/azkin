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

    for (const remote of remoteMonitors) {
      // Buscar coincidencia en monitores locales por nombre o target
      let local = localMonitors.find((m) => {
        const nameMatch = m.name.trim().toLowerCase() === remote.name.trim().toLowerCase();
        const targetMatch = m.target.trim().toLowerCase() === remote.target.trim().toLowerCase();
        return nameMatch || targetMatch;
      });

      // Si el monitor del nodo remoto no existe en el nodo local, crearlo automáticamente para reflejarlo en ambas instancias
      if (!local) {
        local = await this.monitors.create({
          name: remote.name,
          type: (remote.type as any) || "http",
          target: remote.target,
          userId: actorId,
          interval: 60,
          retryInterval: 30,
          retries: 2,
          group: null,
          tags: [],
          notificationIds: [],
        });
        localMonitors.push(local);
      }

      // Verificar si ya existe un vínculo activo para este monitor local y el remoto
      const alreadyLinked = existingLinks.some(
        (l) => l.localMonitorId === local!.id && l.remoteMonitorId === remote.id,
      );

      if (!alreadyLinked) {
        const link = await this.links.create({
          localMonitorId: local.id,
          federatedInstanceId,
          remoteMonitorId: remote.id,
          remoteMonitorLabel: `${remote.name} (${instance.label})`,
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

    // Si se crearon o vincularon monitores y existe función de sincronización, disparar sync asíncrono
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
