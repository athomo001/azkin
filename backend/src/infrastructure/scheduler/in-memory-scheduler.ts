// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IScheduler } from "../../application/ports/services/scheduler";
import { IMonitorRepository } from "../../application/ports/repositories/monitor-repository";
import { ExecuteCheckUseCase } from "../../application/use-cases/monitoring/execute-check.usecase";
import { IHeartbeatRepository } from "../../application/ports/repositories/heartbeat-repository";
import { IRealtimePublisher } from "../../application/ports/services/realtime-publisher";
import { INotifier } from "../../application/ports/services/notifier";
import { IMonitor } from "../../domain/entities/monitor";
import { IHeartbeat } from "../../domain/entities/heartbeat";
import { MonitorStatus } from "../../domain/value-objects/monitor-status";
import { logger } from "../logger";

interface ScheduledMonitor {
  monitor: IMonitor;
  timeout: NodeJS.Timeout | null;
  lastStatus: MonitorStatus | null;
  retryAttempts: number;
  isStopped: boolean;
}

/**
 * Orquestador en memoria. Usa setTimeout recursivo (patrón safeBeat) para evitar
 * el solapamiento de checks. Además, gestiona monitores pasivos (Push) por timeout de expiración.
 */
export class InMemoryScheduler implements IScheduler {
  private readonly monitors = new Map<string, ScheduledMonitor>();

  constructor(
    private readonly monitorRepo: IMonitorRepository,
    private readonly executeCheck: ExecuteCheckUseCase,
    private readonly heartbeatRepo: IHeartbeatRepository,
    private readonly realtime: IRealtimePublisher,
    private readonly notifier: INotifier,
    private readonly firstCheckDelayMs: number,
  ) {}

  async start(): Promise<void> {
    const actives = await this.monitorRepo.findAllActive();
    for (const monitor of actives) {
      this.schedule(monitor);
    }
    logger.info(`Scheduler iniciado con ${actives.length} monitor(es) activo(s)`);
  }

  schedule(monitor: IMonitor): void {
    if (this.monitors.has(monitor.id)) {
      this.unschedule(monitor.id);
    }
    const scheduled: ScheduledMonitor = {
      monitor,
      timeout: null,
      lastStatus: null,
      retryAttempts: 0,
      isStopped: false,
    };
    this.monitors.set(monitor.id, scheduled);

    if (monitor.type === "push") {
      // En modo pasivo, agenda un timer de expiración
      scheduled.timeout = setTimeout(() => this.handlePushTimeout(scheduled), monitor.interval * 1000);
    } else {
      scheduled.timeout = setTimeout(() => this.safeBeat(scheduled), this.firstCheckDelayMs);
    }
  }

  reschedule(monitor: IMonitor): void {
    const previous = this.monitors.get(monitor.id);
    this.schedule(monitor);
    // Preserva el estado confirmado para no re-alertar por una simple edición de config.
    if (previous) {
      const current = this.monitors.get(monitor.id);
      if (current) current.lastStatus = previous.lastStatus;
    }
  }

  unschedule(monitorId: string): void {
    const scheduled = this.monitors.get(monitorId);
    if (!scheduled) return;
    scheduled.isStopped = true;
    if (scheduled.timeout) clearTimeout(scheduled.timeout);
    this.monitors.delete(monitorId);
  }

  stopAll(): void {
    for (const scheduled of this.monitors.values()) {
      scheduled.isStopped = true;
      if (scheduled.timeout) clearTimeout(scheduled.timeout);
    }
    this.monitors.clear();
  }

  async receivePushHeartbeat(
    monitorId: string,
    clientStatus: "up" | "down",
    clientPing?: number,
    clientMsg?: string,
  ): Promise<void> {
    const scheduled = this.monitors.get(monitorId);
    if (!scheduled || scheduled.isStopped) return;

    if (scheduled.timeout) {
      clearTimeout(scheduled.timeout);
    }

    const status = clientStatus === "down" ? MonitorStatus.DOWN : MonitorStatus.UP;
    const beat: IHeartbeat = {
      monitorId,
      timestamp: new Date(),
      status,
      ping: clientPing ?? null,
      msg: clientMsg ?? "Push heartbeat recibido",
    };

    try {
      await this.heartbeatRepo.save(beat);
      this.realtime.publishHeartbeat(scheduled.monitor.userId, beat);

      // Alerta de transición confirmada
      const lastStatus = scheduled.lastStatus;
      if (lastStatus !== null && lastStatus !== status) {
        const eventType = status === MonitorStatus.DOWN ? "DOWN" : "RECOVERED";
        for (const notifId of scheduled.monitor.notificationIds) {
          await this.notifier.notify({
            notificationId: notifId,
            eventType,
            monitor: scheduled.monitor,
            from: lastStatus,
            to: status,
            beat,
          });
        }
      }
      scheduled.lastStatus = status;
    } catch (error) {
      logger.error(`Error al persistir push heartbeat para monitor ${monitorId}`, error);
    } finally {
      if (!scheduled.isStopped) {
        scheduled.timeout = setTimeout(
          () => this.handlePushTimeout(scheduled),
          scheduled.monitor.interval * 1000,
        );
      }
    }
  }

  private async handlePushTimeout(scheduled: ScheduledMonitor): Promise<void> {
    const status = MonitorStatus.DOWN;
    const beat: IHeartbeat = {
      monitorId: scheduled.monitor.id,
      timestamp: new Date(),
      status,
      ping: null,
      msg: "Push heartbeat timeout: no reportado a tiempo",
    };

    try {
      await this.heartbeatRepo.save(beat);
      this.realtime.publishHeartbeat(scheduled.monitor.userId, beat);

      const lastStatus = scheduled.lastStatus;
      if (lastStatus !== null && lastStatus !== status) {
        // handlePushTimeout siempre transiciona a DOWN (ver arriba).
        for (const notifId of scheduled.monitor.notificationIds) {
          await this.notifier.notify({
            notificationId: notifId,
            eventType: "DOWN",
            monitor: scheduled.monitor,
            from: lastStatus,
            to: status,
            beat,
          });
        }
      }
      scheduled.lastStatus = status;
    } catch (error) {
      logger.error(`Error en timeout de expiración push para monitor ${scheduled.monitor.id}`, error);
    } finally {
      if (!scheduled.isStopped) {
        scheduled.timeout = setTimeout(
          () => this.handlePushTimeout(scheduled),
          scheduled.monitor.interval * 1000,
        );
      }
    }
  }

  private async safeBeat(scheduled: ScheduledMonitor): Promise<void> {
    let nextDelaySeconds = scheduled.monitor.interval;
    try {
      const outcome = await this.executeCheck.execute(scheduled.monitor, {
        lastStatus: scheduled.lastStatus,
        retryAttempts: scheduled.retryAttempts,
      });
      scheduled.lastStatus = outcome.lastStatus;
      scheduled.retryAttempts = outcome.retryAttempts;
      nextDelaySeconds = outcome.nextDelaySeconds;
    } catch (error) {
      logger.error(`safeBeat falló para monitor ${scheduled.monitor.id}`, error);
    } finally {
      if (!scheduled.isStopped) {
        scheduled.timeout = setTimeout(
          () => this.safeBeat(scheduled),
          nextDelaySeconds * 1000,
        );
      }
    }
  }
}
