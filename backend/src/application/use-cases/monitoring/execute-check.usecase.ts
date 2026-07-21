// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { ICheckerRegistry } from "../../ports/services/check-strategy";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IRealtimePublisher } from "../../ports/services/realtime-publisher";
import { INotifier } from "../../ports/services/notifier";
import { IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { findActiveMaintenanceForMonitor } from "../../services/maintenance-scope-policy";
import { IMonitoringEngineConfigResolver } from "../../ports/services/monitoring-engine-config-resolver";
import { AlertEventType } from "../../../domain/value-objects/alert-event-type";
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
    private readonly monitoringConfig: IMonitoringEngineConfigResolver,
  ) {}

  async execute(monitor: IMonitor, ctx: CheckContext): Promise<CheckOutcome> {
    const activeMaintenance = findActiveMaintenanceForMonitor(monitor, await this.maintenance.findActive());
    if (activeMaintenance) {
      return this.recordMaintenanceBeat(monitor, ctx, activeMaintenance.name);
    }

    const { degradedLatencyMs, acceleratedIntervalSeconds } = await this.monitoringConfig.resolve();
    // El acelerado nunca es más rápido que el propio retryInterval del monitor: si un admin
    // configuró reintentos cada 30s para confirmar una caída, no tiene sentido que, una vez
    // confirmada, Azkin la revise más seguido (cada 15s) que durante la fase de verificación.
    const effectiveAcceleratedSeconds = Math.max(acceleratedIntervalSeconds, monitor.retryInterval);

    const result = await this.registry.resolve(monitor.type).check(monitor);

    let status: MonitorStatus;
    let retryAttempts = ctx.retryAttempts;
    let nextDelaySeconds: number;
    let isLocalNetworkDown = false;
    let beatMsg = result.msg;

    if (result.ok) {
      retryAttempts = 0;
      // Un HTTP que responde OK pero muy lento se trata como degradado, no como UP —
      // sin esperar a que la petición muera por timeout completo.
      const isSlowHttp = monitor.type === "http" && result.ping !== null && result.ping > degradedLatencyMs;
      if (isSlowHttp) {
        status = MonitorStatus.DEGRADED;
        nextDelaySeconds = effectiveAcceleratedSeconds;
        beatMsg = `Latencia alta: ${result.ping}ms (umbral ${degradedLatencyMs}ms)`;
      } else {
        status = MonitorStatus.UP;
        nextDelaySeconds = monitor.interval;
      }
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
        // Polling adaptativo: mientras el monitor no esté UP, se chequea más seguido para
        // registrar la curva de recuperación sin esperar el intervalo normal configurado.
        nextDelaySeconds = effectiveAcceleratedSeconds;
      }
    }

    const beat: IHeartbeat = {
      monitorId: monitor.id,
      timestamp: new Date(),
      status,
      ping: result.ping,
      msg: isLocalNetworkDown ? "Error de conexión local (ISP Outage)" : beatMsg,
      certExpiry: (result as any).certExpiry,
      domainExpiry: (result as any).domainExpiry,
      isLocalNetworkDown,
    };

    await this.heartbeats.save(beat);
    this.realtime.publishHeartbeat(monitor.userId, beat);

    // Alerta solo en transición confirmada UP/DOWN/DEGRADED (PENDING no dispara).
    let lastStatus = ctx.lastStatus;
    if (status === MonitorStatus.UP || status === MonitorStatus.DOWN || status === MonitorStatus.DEGRADED) {
      if (lastStatus !== null && lastStatus !== status) {
        // Si el fallo es por una caída confirmada de la red local, evitamos enviar alertas
        // para no generar falsos positivos spameando al usuario.
        if (!isLocalNetworkDown) {
          const eventType: AlertEventType =
            status === MonitorStatus.DOWN ? "DOWN" : status === MonitorStatus.DEGRADED ? "DEGRADED" : "RECOVERED";
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

          // Heurística post-caída (fire-and-forget, solo HTTP): un DOWN confirmado puede en
          // realidad ser un servidor vivo a nivel de red cuya app dejó de responder. No se
          // espera ni bloquea el aviso DOWN ya emitido arriba.
          if (status === MonitorStatus.DOWN && monitor.type === "http") {
            void this.runDegradationHeuristic(monitor, beat).catch((err) =>
              logger.error(`Error en heurística de degradación para monitor ${monitor.name}: ${err}`),
            );
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
   * Diagnóstico posterior a un DOWN confirmado (solo monitores HTTP): reintenta a nivel de
   * red/TCP el mismo host para distinguir "servidor realmente caído" de "servidor vivo pero la
   * aplicación no responde" (degradación/sobrecarga). Fire-and-forget: no toca
   * `ctx.lastStatus`/`retryAttempts`/`nextDelaySeconds` — la aceleración de polling ya aplicó vía
   * la rama DOWN de `execute()`, independiente de esta heurística asíncrona.
   */
  private async runDegradationHeuristic(monitor: IMonitor, downBeat: IHeartbeat): Promise<void> {
    let hostname: string;
    let port: number;
    try {
      const url = new URL(monitor.target);
      hostname = url.hostname;
      port = url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80;
    } catch {
      return;
    }

    const [pingResult, portResult] = await Promise.allSettled([
      this.registry.resolve("ping").check({ ...monitor, target: hostname }),
      this.registry.resolve("port").check({ ...monitor, target: hostname, port }),
    ]);

    const pingOk = pingResult.status === "fulfilled" && pingResult.value.ok;
    const portOk = portResult.status === "fulfilled" && portResult.value.ok;
    if (!pingOk && !portOk) return; // Caída real confirmada — el DOWN ya emitido queda como veredicto final.

    const layer = pingOk && portOk ? "ping y TCP" : pingOk ? "ping" : "TCP";
    const beat: IHeartbeat = {
      monitorId: monitor.id,
      timestamp: new Date(),
      status: MonitorStatus.DEGRADED,
      ping: downBeat.ping,
      msg: `Servidor responde a nivel de red (${layer}) pero la aplicación no — posible degradación/sobrecarga.`,
      isLocalNetworkDown: false,
    };

    await this.heartbeats.save(beat);
    this.realtime.publishHeartbeat(monitor.userId, beat);

    for (const notifId of monitor.notificationIds) {
      await this.notifier.notify({
        notificationId: notifId,
        eventType: "DEGRADED",
        monitor,
        from: MonitorStatus.DOWN,
        to: MonitorStatus.DEGRADED,
        beat,
      });
    }
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
