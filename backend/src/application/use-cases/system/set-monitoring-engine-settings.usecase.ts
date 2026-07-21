// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitoringEngineSettingsRepository } from "../../ports/repositories/monitoring-engine-settings-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";

export interface SetMonitoringEngineSettingsInput {
  degradedLatencyMs: number | null;
  acceleratedIntervalSeconds: number | null;
}

/**
 * Caso de uso para fijar (o restablecer, con `null`) los overrides de configuración del motor de
 * monitoreo. La validación de rango (entero positivo) vive en el schema Zod del borde HTTP
 * (infrastructure/http/schemas/system.schema.ts), mismo criterio que el resto del módulo system.
 */
export class SetMonitoringEngineSettingsUseCase {
  constructor(
    private readonly settingsRepo: IMonitoringEngineSettingsRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, data: SetMonitoringEngineSettingsInput): Promise<void> {
    await this.settingsRepo.upsert({ ...data, updatedById: actorId });

    await this.auditLog.record({
      actorId,
      action: "MONITORING_ENGINE_SETTINGS_SET",
      targetType: "monitoring-engine-settings",
      metadata: { ...data },
    });
  }
}
