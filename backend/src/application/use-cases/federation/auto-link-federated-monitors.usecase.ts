// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { ListRemoteMonitorsUseCase } from "./list-remote-monitors.usecase";
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";

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
  private static inProgress = new Set<string>();

  constructor(
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly links: IFederatedMonitorLinkRepository,
    private readonly monitors: IMonitorRepository,
    private readonly listRemoteMonitors: ListRemoteMonitorsUseCase,
    private readonly auditLog: IAuditLogRepository,
    private readonly heartbeats?: IHeartbeatRepository,
  ) {}

  async execute(actorId: string, federatedInstanceId: string): Promise<AutoLinkResult> {
    const lockKey = `${actorId}:${federatedInstanceId}`;
    if (AutoLinkFederatedMonitorsUseCase.inProgress.has(lockKey)) {
      const existing = await this.links.findByFederatedInstanceId(federatedInstanceId);
      return { linkedCount: existing.length, links: existing };
    }

    AutoLinkFederatedMonitorsUseCase.inProgress.add(lockKey);
    try {
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

        // Si el monitor del nodo remoto no existe en el nodo local, crearlo automáticamente
        if (!local) {
          // Re-verificar contra base de datos por si se creó concurrentemente
          const currentAll = await this.monitors.findAll();
          local = currentAll.find((m) => {
            const nameMatch = m.name.trim().toLowerCase() === remote.name.trim().toLowerCase();
            const targetMatch = m.target.trim().toLowerCase() === remote.target.trim().toLowerCase();
            return nameMatch || targetMatch;
          });

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

            // Inicializar el heartbeat local con la medición del nodo remoto para evitar estado PENDING
            if (this.heartbeats && remote.lastStatus) {
              const statusStr =
                remote.lastStatus === 1 || remote.lastStatus === "UP"
                  ? ("UP" as any)
                  : remote.lastStatus === 4 || remote.lastStatus === "DEGRADED"
                    ? ("DEGRADED" as any)
                    : ("DOWN" as any);

              await this.heartbeats.save({
                monitorId: local.id,
                status: statusStr,
                ping: remote.lastPing ?? null,
                timestamp: new Date(),
                isLocalNetworkDown: false,
                msg: null,
              });
            }
          }
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
    } finally {
      AutoLinkFederatedMonitorsUseCase.inProgress.delete(lockKey);
    }
  }

  private triggerSync?: () => Promise<void>;

  setSyncTrigger(fn: () => Promise<void>): void {
    this.triggerSync = fn;
  }
}
