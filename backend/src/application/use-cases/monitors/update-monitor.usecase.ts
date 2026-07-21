// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  IMonitorRepository,
  UpdateMonitorData,
} from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { diffFields } from "../../services/diff-fields";
import { IMonitor } from "../../../domain/entities/monitor";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para actualizar la configuración de un monitor de red.
 * Almacena los cambios y actualiza el agendamiento del programador (reschedule o unschedule) según isActive.
 */
export class UpdateMonitorUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly scheduler: IScheduler,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, id: string, data: UpdateMonitorData): Promise<IMonitor> {
    const before = await this.monitors.findById(id);

    const updated = await this.monitors.update(id, data);
    if (!updated) {
      throw new NotFoundError("Monitor no encontrado");
    }

    if (updated.isActive) {
      this.scheduler.reschedule(updated);
    } else {
      this.scheduler.unschedule(updated.id);
    }

    await this.auditLog.record({
      actorId,
      action: "MONITOR_UPDATE",
      targetType: "monitor",
      targetIds: [id],
      metadata: { changes: diffFields((before as unknown as Record<string, unknown>) ?? {}, data as unknown as Record<string, unknown>) },
    });

    return updated;
  }
}
