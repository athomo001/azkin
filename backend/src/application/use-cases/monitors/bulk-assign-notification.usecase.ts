// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";

export interface BulkAssignNotificationInput {
  actorId: string;
  monitorIds: string[];
  notificationId: string;
  action: "add" | "remove";
}

export interface BulkAssignNotificationOutput {
  updatedCount: number;
}

/**
 * Caso de uso para vincular o desvincular un canal de notificación de múltiples monitores en
 * una sola operación — evita tener que editar monitor por monitor cuando se reemplaza un canal
 * (crear uno nuevo no vuelve a asociarlo automáticamente a los monitores que usaban el anterior).
 */
export class BulkAssignNotificationUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly scheduler: IScheduler,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: BulkAssignNotificationInput): Promise<BulkAssignNotificationOutput> {
    let updatedCount = 0;

    for (const id of input.monitorIds) {
      const monitor = await this.monitors.findById(id);
      if (!monitor) continue;

      const has = monitor.notificationIds.includes(input.notificationId);
      if (input.action === "add" && has) continue;
      if (input.action === "remove" && !has) continue;

      const notificationIds =
        input.action === "add"
          ? [...monitor.notificationIds, input.notificationId]
          : monitor.notificationIds.filter((nid) => nid !== input.notificationId);

      const updated = await this.monitors.update(id, { notificationIds });
      if (updated) {
        if (updated.isActive) this.scheduler.reschedule(updated);
        else this.scheduler.unschedule(updated.id);
        updatedCount++;
      }
    }

    await this.auditLog.record({
      actorId: input.actorId,
      action: "MONITORS_BULK_ASSIGN_NOTIFICATION",
      targetType: "monitor",
      targetIds: input.monitorIds,
      metadata: { notificationId: input.notificationId, action: input.action, updatedCount },
    });

    return { updatedCount };
  }
}
