// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository, UpdateMonitorData } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";

export type BulkUpdateMonitorsPatch = Pick<
  UpdateMonitorData,
  "ignoreTls" | "tags" | "notificationIds" | "integrityEnabled" | "integrityProfile" | "integrityIgnoredCssSelectors" | "integrityThreshold"
>;

export interface BulkUpdateMonitorsInput {
  actorId: string;
  monitorIds: string[];
  patch: BulkUpdateMonitorsPatch;
}

export interface BulkUpdateMonitorsOutput {
  updatedCount: number;
}

/**
 * Caso de uso para aplicar el mismo cambio de configuración (TLS, etiquetas, canales de alerta,
 * Integridad Visual) a todos los monitores de un grupo en una sola operación — evita editarlos
 * uno por uno desde app-monitor-form cuando el cambio es idéntico para todo el grupo.
 */
export class BulkUpdateMonitorsUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly scheduler: IScheduler,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: BulkUpdateMonitorsInput): Promise<BulkUpdateMonitorsOutput> {
    let updatedCount = 0;

    for (const id of input.monitorIds) {
      const updated = await this.monitors.update(id, input.patch);
      if (!updated) continue;

      // `scheduled.monitor` vive en memoria dentro del scheduler y no se refresca solo — sin
      // reschedule, el checker seguiría corriendo con el ignoreTls/tags/etc. viejos hasta el
      // próximo restart del proceso (ver InMemoryScheduler.safeBeat).
      if (updated.isActive) this.scheduler.reschedule(updated);
      else this.scheduler.unschedule(updated.id);
      updatedCount++;
    }

    await this.auditLog.record({
      actorId: input.actorId,
      action: "MONITORS_BULK_UPDATE",
      targetType: "monitor",
      targetIds: input.monitorIds,
      metadata: { patch: input.patch, updatedCount },
    });

    return { updatedCount };
  }
}
