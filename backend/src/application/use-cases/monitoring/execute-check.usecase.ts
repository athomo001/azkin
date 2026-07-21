// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { ICheckerRegistry } from "../../ports/services/check-strategy";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IRealtimePublisher } from "../../ports/services/realtime-publisher";
import { INotifier } from "../../ports/services/notifier";
import { IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { findActiveMaintenanceForMonitor } from "../../services/maintenance-scope-policy";
import { IMonitor } from "../../../domain/entities/monitor";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";
import { NetworkDiagnostics } from "../../../infrastructure/services/network-diagnostics";
import { logger } from "../../../infrastructure/logger";

/** Estado runtime que aporta el scheduler para decidir reintentos/transiciones. */
export interface CheckContext {
  lastStatus: MonitorStatus | null;
  retryAttempts: number;
}

export interface CheckOutcome {
  status: MonitorStatus;
  lastStatus: MonitorStatus | null;
  retryAttempts: number;
  nextDelaySeconds: number;
}

/**
 * Ejecuta un beat: check → persiste → publica → alerta en transición confirmada.
 * La máquina de reintentos vive aquí; el scheduler solo conserva el estado runtime.
 */
export class ExecuteCheckUseCase {
  constructor(
    private readonly registry: ICheckerRegistry,
    private readonly heartbeats: IHeartbeatRepository,
    private readonly realtime: IRealtimePublisher,
    private readonly notifier: INotifier,
    private readonly maintenance: IMaintenanceRepository,
  ) {}

  async execute(monitor: IMonitor, ctx: CheckContext): Promise<CheckOutcome> {
    const activeMaintenance = findActiveMaintenanceForMonitor(monitor, await this.maintenance.findActive());
    if (activeMaintenance) {
      return this.recordMaintenanceBeat(monitor, ctx, activeMaintenance.name);
    }

    const result = await this.registry.resolve(monitor.type).check(monitor);

    let status: MonitorStatus;
    let retryAttempts = ctx.retryAttempts;
    let nextDelaySeconds: number;
    let isLocalNetworkDown = false;

    if (result.ok) {
      status = MonitorStatus.UP;
      retryAttempts = 0;
      nextDelaySeconds = monitor.interval;
    } else {
      // Si el chequeo falla, verificar si es debido a la falta de conexión local a Internet
      isLocalNetworkDown = await NetworkDiagnostics.checkIsLocalNetworkDown();

      if (retryAttempts < monitor.retries) {
        retryAttempts += 1;
        status = MonitorStatus.PENDING;
        nextDelaySeconds = monitor.retryInterval;
      } else {
        status = MonitorStatus.DOWN;
        retryAttempts = 0;
        nextDelaySeconds = monitor.interval;
      }
    }

    const beat: IHeartbeat = {
      monitorId: monitor.id,
      timestamp: new Date(),
      status,
      ping: result.ping,
      msg: isLocalNetworkDown ? "Error de conexión local (ISP Outage)" : result.msg,
      certExpiry: (result as any).certExpiry,
      domainExpiry: (result as any).domainExpiry,
      isLocalNetworkDown,
    };

    await this.heartbeats.save(beat);
    this.realtime.publishHeartbeat(monitor.userId, beat);

    // Alerta solo en transición confirmada UP <-> DOWN (PENDING no dispara).
    let lastStatus = ctx.lastStatus;
    if (status === MonitorStatus.UP || status === MonitorStatus.DOWN) {
      if (lastStatus !== null && lastStatus !== status) {
        // Si el fallo es por una caída confirmada de la red local, evitamos enviar alertas
        // para no generar falsos positivos spameando al usuario.
        if (!isLocalNetworkDown) {
          const eventType = status === MonitorStatus.DOWN ? "DOWN" : "RECOVERED";
          for (const notifId of monitor.notificationIds) {
            await this.notifier.notify({
              notificationId: notifId,
              eventType,
              monitor,
              from: lastStatus,
              to: status,
              beat,
            });
          }
        } else {
          logger.warn(
            `[Diagnóstico de Red] Alerta omitida para monitor ${monitor.name} debido a ISP Outage local.`
          );
        }
      }
      lastStatus = status;
    }

    return { status, lastStatus, retryAttempts, nextDelaySeconds };
  }

  /**
   * Registra un beat de mantenimiento sin ejecutar el checker real ni alertar (AZ-040): el
   * silenciado es implícito porque MAINTENANCE nunca entra al bloque de transición UP/DOWN de
   * arriba. `ctx.lastStatus`/`retryAttempts` se preservan intactos para que, al terminar la
   * ventana, la próxima transición real se compare contra el último estado UP/DOWN confirmado
   * (no contra MAINTENANCE).
   */
  private async recordMaintenanceBeat(
    monitor: IMonitor,
    ctx: CheckContext,
    windowName: string,
  ): Promise<CheckOutcome> {
    const beat: IHeartbeat = {
      monitorId: monitor.id,
      timestamp: new Date(),
      status: MonitorStatus.MAINTENANCE,
      ping: null,
      msg: `En mantenimiento: ${windowName}`,
      isLocalNetworkDown: false,
    };

    await this.heartbeats.save(beat);
    this.realtime.publishHeartbeat(monitor.userId, beat);

    return {
      status: MonitorStatus.MAINTENANCE,
      lastStatus: ctx.lastStatus,
      retryAttempts: ctx.retryAttempts,
      nextDelaySeconds: monitor.interval,
    };
  }
}
