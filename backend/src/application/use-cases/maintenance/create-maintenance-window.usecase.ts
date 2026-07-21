// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { CreateMaintenanceWindowData, IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IMaintenanceWindow } from "../../../domain/entities/maintenance-window";

/**
 * Caso de uso para crear una ventana de mantenimiento (inmediata o programada).
 * La validación de fechas según el modo vive en el schema Zod del borde HTTP
 * (infrastructure/http/schemas/maintenance.schema.ts).
 */
export class CreateMaintenanceWindowUseCase {
  constructor(
    private readonly maintenance: IMaintenanceRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: CreateMaintenanceWindowData): Promise<IMaintenanceWindow> {
    const window = await this.maintenance.create(input);

    await this.auditLog.record({
      actorId: input.createdBy,
      action: "MAINTENANCE_CREATE",
      targetType: "maintenance-window",
      targetIds: [window.id],
      metadata: { name: window.name, scope: window.scope, mode: window.mode },
    });

    return window;
  }
}
