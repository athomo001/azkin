// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";

export interface BulkDeleteMonitorsOutput {
  deletedCount: number;
  deletedIds: string[];
}

/**
 * Caso de uso para eliminar múltiples monitores en una sola operación.
 * Solo elimina los que efectivamente pertenecen al usuario (ids inexistentes/ajenos se ignoran).
 */
export class BulkDeleteMonitorsUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats: IHeartbeatRepository,
    private readonly scheduler: IScheduler,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, ids: string[]): Promise<BulkDeleteMonitorsOutput> {
    const owned: string[] = [];
    for (const id of ids) {
      const monitor = await this.monitors.findById(id);
      if (monitor) owned.push(id);
    }

    if (owned.length === 0) {
      return { deletedCount: 0, deletedIds: [] };
    }

    for (const id of owned) {
      this.scheduler.unschedule(id);
    }

    const deletedCount = await this.monitors.deleteMany(owned);

    for (const id of owned) {
      await this.heartbeats.deleteByMonitor(id);
    }

    await this.auditLog.record({
      actorId,
      action: "MONITORS_BULK_DELETE",
      targetType: "monitor",
      targetIds: owned,
      metadata: { count: deletedCount },
    });

    return { deletedCount, deletedIds: owned };
  }
}
