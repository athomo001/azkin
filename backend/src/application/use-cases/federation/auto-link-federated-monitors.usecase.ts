// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { ListRemoteMonitorsUseCase } from "./list-remote-monitors.usecase";
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";
import { getErrorMessage } from "../../services/get-error-message";
import { logger } from "../../../infrastructure/logger";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";
import { IFederationClient } from "../../ports/services/federation-client";

import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";

/**
 * Traduce el `lastStatus` del catálogo remoto (numérico `MonitorStatus` o, por compatibilidad,
 * las etiquetas de texto que ya usa el sondeo periódico) al enum numérico real que exige el
 * schema de heartbeats (`status: { type: Number, enum: [0,1,2,3,4] }`, ver AZ-050). Antes de este
 * fix se guardaba el string literal "UP"/"DOWN"/"DEGRADED" tal cual, lo que Mongoose no puede
 * castear a Number — `heartbeats.save()` fallaba siempre con un CastError y el monitor recién
 * importado quedaba sin heartbeat inicial (PENDING) pese a que el fix ya estaba "aplicado".
 */
function mapRemoteStatus(lastStatus: number | string): MonitorStatus {
  if (lastStatus === MonitorStatus.UP || lastStatus === "UP") return MonitorStatus.UP;
  if (lastStatus === MonitorStatus.DEGRADED || lastStatus === "DEGRADED") return MonitorStatus.DEGRADED;
  if (lastStatus === MonitorStatus.MAINTENANCE || lastStatus === "MAINTENANCE") return MonitorStatus.MAINTENANCE;
  return MonitorStatus.DOWN;
}

export interface AutoLinkFailure {
  remoteMonitorName: string;
  error: string;
}

export interface AutoLinkResult {
  linkedCount: number;
  links: IFederatedMonitorLink[];
  /** Monitores remotos que no se pudieron importar/vincular (ver AZ-050): un fallo individual
   * (ej. un monitor tipo "port" sin puerto informado) ya no aborta el resto del lote. */
  failedCount: number;
  failures: AutoLinkFailure[];
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
    // Necesarios para avisarle al par que registre el vínculo recíproco (ver AZ-050): sin esto, el
    // gráfico "Multi-Nodo" solo aparece del lado que importó el monitor, no del lado de origen.
    private readonly client?: IFederationClient,
    private readonly decryptSecret?: (encrypted: string, key: string) => string,
    private readonly encryptionKey?: string,
  ) {}

  async execute(actorId: string, federatedInstanceId: string): Promise<AutoLinkResult> {
    const lockKey = `${actorId}:${federatedInstanceId}`;
    if (AutoLinkFederatedMonitorsUseCase.inProgress.has(lockKey)) {
      const existing = await this.links.findByFederatedInstanceId(federatedInstanceId);
      return { linkedCount: existing.length, links: existing, failedCount: 0, failures: [] };
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
      const failures: AutoLinkFailure[] = [];

      // Cada monitor remoto se procesa de forma aislada (mismo patrón que RunFederationSyncUseCase):
      // que uno falle (ej. tipo "port" con datos incompletos) no debe abortar el resto del lote — ver
      // AZ-050, bug reportado en QA real ("tengo 3 monitores y solo se cargó 1").
      for (const remote of remoteMonitors) {
        try {
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
                // Requerido por el schema para type "port" (TCP) — sin esto, crear el monitor
                // remoto lanzaba ValidationError y abortaba (antes) el resto del lote.
                port: remote.port ?? undefined,
                // Marca de origen (ver AZ-050): permite que al eliminar la instancia federada se
                // borren también los monitores que se auto-importaron por su causa, sin tocar
                // monitores que el Admin ya tenía manualmente y que solo coincidieron por nombre.
                importedFromFederatedInstanceId: federatedInstanceId,
                userId: actorId,
                interval: 60,
                retryInterval: 30,
                retries: 2,
                group: null,
                tags: [],
                notificationIds: [],
              });
              localMonitors.push(local);

              // Inicializar el heartbeat local con la medición del nodo remoto para evitar estado
              // PENDING. Importante: `remote.lastStatus` puede ser DOWN (valor numérico 0), que es
              // falsy en JS — comparar explícitamente contra null/undefined, no con `if (valor)`.
              if (this.heartbeats && remote.lastStatus !== null && remote.lastStatus !== undefined) {
                await this.heartbeats.save({
                  monitorId: local.id,
                  status: mapRemoteStatus(remote.lastStatus),
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

            // Avisar al par para que registre el vínculo de vuelta (best-effort: si falla, nuestro
            // propio vínculo ya quedó creado igual; el par puede recuperarlo con "Auto-vincular").
            if (this.client && this.decryptSecret && this.encryptionKey) {
              try {
                const secret = this.decryptSecret(instance.remoteSecretEncrypted, this.encryptionKey);
                await this.client.registerPeerLink(
                  { remoteUrl: instance.remoteUrl, secret },
                  { localMonitorId: remote.id, remoteMonitorId: local.id, remoteMonitorName: local.name },
                );
              } catch (err) {
                logger.error(
                  `[Federation] No se pudo registrar el vínculo recíproco en "${instance.label}" para "${remote.name}": ${getErrorMessage(err)}`,
                );
              }
            }
          }
        } catch (err) {
          const message = getErrorMessage(err);
          logger.error(
            `[Federation] Fallo al auto-vincular el monitor remoto "${remote.name}" (${instance.label}): ${message}`,
          );
          failures.push({ remoteMonitorName: remote.name, error: message });
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
        failedCount: failures.length,
        failures,
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
