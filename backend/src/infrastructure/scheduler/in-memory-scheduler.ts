import { IScheduler } from "../../application/ports/services/scheduler";
import { IMonitorRepository } from "../../application/ports/repositories/monitor-repository";
import { ExecuteCheckUseCase } from "../../application/use-cases/monitoring/execute-check.usecase";
import { IMonitor } from "../../domain/entities/monitor";
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
 * el solapamiento de checks: agenda el siguiente beat solo al terminar el actual.
 */
export class InMemoryScheduler implements IScheduler {
  private readonly monitors = new Map<string, ScheduledMonitor>();

  constructor(
    private readonly monitorRepo: IMonitorRepository,
    private readonly executeCheck: ExecuteCheckUseCase,
    private readonly firstCheckDelayMs: number,
  ) {}

  async start(): Promise<void> {
    const actives = await this.monitorRepo.findAllActive();
    for (const monitor of actives) {
      this.schedule(monitor);
    }
    logger.info(`Scheduler started with ${actives.length} active monitor(s)`);
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
    scheduled.timeout = setTimeout(() => this.safeBeat(scheduled), this.firstCheckDelayMs);
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
      logger.error(`Beat failed for monitor ${scheduled.monitor.id}`, error);
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
