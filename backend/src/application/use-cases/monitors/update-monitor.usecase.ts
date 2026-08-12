// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  IMonitorRepository,
  UpdateMonitorData,
} from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { diffFields } from "../../services/diff-fields";
import { SENSITIVE_MONITOR_FIELDS } from "../../services/monitor-secrets";
import { maskSecret } from "../../services/notification-secrets";
import { IMonitor } from "../../../domain/entities/monitor";
import { NotFoundError } from "../../../domain/errors/domain-error";

/** AZ-062: enmascara los valores from/to de campos sensibles (credenciales SNMP) antes de que
 * queden persistidos en texto plano dentro de `metadata.changes` del audit log — mismo criterio
 * ya usado para los secretos de canales de notificación. */
function redactSensitiveDiff(
  changes: Record<string, { from: unknown; to: unknown }>,
): Record<string, { from: unknown; to: unknown }> {
  const redacted = { ...changes };
  for (const key of SENSITIVE_MONITOR_FIELDS) {
    const change = redacted[key];
    if (!change) continue;
    redacted[key] = {
      from: typeof change.from === "string" && change.from ? maskSecret(change.from) : change.from,
      to: typeof change.to === "string" && change.to ? maskSecret(change.to) : change.to,
    };
  }
  return redacted;
}

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
    const wasPaused = before ? !before.isActive : false;

    const updated = await this.monitors.update(id, data);
    if (!updated) {
      throw new NotFoundError("Monitor no encontrado");
    }

    if (updated.isActive) {
      if (wasPaused) {
        this.scheduler.schedule(updated);
        await this.scheduler.triggerCheck?.(updated.id);
      } else {
        this.scheduler.reschedule(updated);
      }
    } else {
      this.scheduler.unschedule(updated.id);
    }

    await this.auditLog.record({
      actorId,
      action: "MONITOR_UPDATE",
      targetType: "monitor",
      targetIds: [id],
      metadata: {
        changes: redactSensitiveDiff(
          diffFields((before as unknown as Record<string, unknown>) ?? {}, data as unknown as Record<string, unknown>),
        ),
      },
    });

    return updated;
  }
}
