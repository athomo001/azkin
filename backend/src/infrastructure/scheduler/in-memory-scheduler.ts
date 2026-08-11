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
  // Estado de la guarda anti-flapping — ver ExecuteCheckUseCase.
  recentTransitionTimestamps: number[];
  lastNotifiedStatus: MonitorStatus | null;
}

/**
 * Orquestador en memoria. Usa setTimeout recursivo (patrón safeBeat) para evitar
 * el solapamiento de checks. Además, gestiona monitores pasivos (Push) por timeout de expiración.
 */
export class InMemoryScheduler implements IScheduler {
  private static readonly OUTAGE_STABLE_UP_MS = 60 * 60 * 1000;
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
      recentTransitionTimestamps: [],
      lastNotifiedStatus: null,
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
      if (current) {
        current.lastStatus = previous.lastStatus;
        current.recentTransitionTimestamps = previous.recentTransitionTimestamps;
        current.lastNotifiedStatus = previous.lastNotifiedStatus;
      }
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
      await this.applyOutageLatchForStatus(scheduled, status, beat.timestamp);
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
      await this.applyOutageLatchForStatus(scheduled, status, beat.timestamp);
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
        recentTransitionTimestamps: scheduled.recentTransitionTimestamps,
        lastNotifiedStatus: scheduled.lastNotifiedStatus,
      });
      scheduled.lastStatus = outcome.lastStatus;
      scheduled.retryAttempts = outcome.retryAttempts;
      scheduled.recentTransitionTimestamps = outcome.recentTransitionTimestamps;
      scheduled.lastNotifiedStatus = outcome.lastNotifiedStatus;
      await this.applyOutageLatchForStatus(scheduled, outcome.status, new Date());
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

  private async applyOutageLatchForStatus(
    scheduled: ScheduledMonitor,
    status: MonitorStatus,
    at: Date,
  ): Promise<void> {
    const monitor = scheduled.monitor;
    const prevLastOutage = monitor.lastOutageStartedAt ?? null;
    const prevOngoingOutage = monitor.ongoingOutageStartedAt ?? null;
    const prevRecoveryUpSince = monitor.outageRecoveryUpSince ?? null;

    let nextLastOutage = prevLastOutage;
    let nextOngoingOutage = prevOngoingOutage;
    let nextRecoveryUpSince = prevRecoveryUpSince;

    const isOutageStatus =
      status === MonitorStatus.DOWN ||
      status === MonitorStatus.DEGRADED ||
      status === MonitorStatus.PENDING;

    if (isOutageStatus) {
      if (!nextOngoingOutage) {
        nextOngoingOutage = at;
        nextLastOutage = at;
      }
      nextRecoveryUpSince = null;
    } else if (status === MonitorStatus.UP) {
      if (nextOngoingOutage) {
        if (!nextRecoveryUpSince) {
          nextRecoveryUpSince = at;
        }
        const stableMs = at.getTime() - nextRecoveryUpSince.getTime();
        if (stableMs >= InMemoryScheduler.OUTAGE_STABLE_UP_MS) {
          nextOngoingOutage = null;
          nextRecoveryUpSince = null;
        }
      } else {
        nextRecoveryUpSince = null;
      }
    } else {
      // MAINTENANCE u otros estados no-UP: no inician una caída nueva por sí solos, pero
      // cortan la continuidad de recuperación estable si había un incidente en curso.
      if (nextOngoingOutage) {
        nextRecoveryUpSince = null;
      }
    }

    const hasChanged =
      (prevLastOutage?.getTime() ?? -1) !== (nextLastOutage?.getTime() ?? -1) ||
      (prevOngoingOutage?.getTime() ?? -1) !== (nextOngoingOutage?.getTime() ?? -1) ||
      (prevRecoveryUpSince?.getTime() ?? -1) !== (nextRecoveryUpSince?.getTime() ?? -1);

    if (!hasChanged) return;

    monitor.lastOutageStartedAt = nextLastOutage;
    monitor.ongoingOutageStartedAt = nextOngoingOutage;
    monitor.outageRecoveryUpSince = nextRecoveryUpSince;

    try {
      await this.monitorRepo.update(monitor.id, {
        lastOutageStartedAt: nextLastOutage,
        ongoingOutageStartedAt: nextOngoingOutage,
        outageRecoveryUpSince: nextRecoveryUpSince,
      });
    } catch (err) {
      logger.warn(`No se pudo persistir el latch de caída para monitor ${monitor.id}`, err);
    }
  }
}
