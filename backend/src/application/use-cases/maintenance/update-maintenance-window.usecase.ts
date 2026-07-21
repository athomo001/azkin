// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMaintenanceRepository, UpdateMaintenanceWindowData } from "../../ports/repositories/maintenance-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { diffFields } from "../../services/diff-fields";
import { IMaintenanceWindow } from "../../../domain/entities/maintenance-window";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para editar una ventana de mantenimiento (alcance, fechas, nombre/descripción).
 * Una ventana ya cerrada no puede editarse — crear una nueva en su lugar.
 */
export class UpdateMaintenanceWindowUseCase {
  constructor(
    private readonly maintenance: IMaintenanceRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, id: string, data: UpdateMaintenanceWindowData): Promise<IMaintenanceWindow> {
    const existing = await this.maintenance.findById(id);
    if (!existing) {
      throw new NotFoundError("Ventana de mantenimiento no encontrada");
    }
    if (existing.closedAt !== null) {
      throw new ValidationError("No se puede editar una ventana de mantenimiento ya cerrada");
    }

    const updated = await this.maintenance.update(id, data);
    if (!updated) {
      throw new NotFoundError("Ventana de mantenimiento no encontrada");
    }

    await this.auditLog.record({
      actorId,
      action: "MAINTENANCE_UPDATE",
      targetType: "maintenance-window",
      targetIds: [id],
      metadata: { changes: diffFields(existing as unknown as Record<string, unknown>, data as unknown as Record<string, unknown>) },
    });

    return updated;
  }
}
