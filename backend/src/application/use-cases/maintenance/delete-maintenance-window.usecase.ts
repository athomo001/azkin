// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para eliminar una ventana de mantenimiento (ej. una programada que nunca
 * llegó a activarse, o limpieza de histórico).
 */
export class DeleteMaintenanceWindowUseCase {
  constructor(
    private readonly maintenance: IMaintenanceRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, id: string): Promise<void> {
    const exists = await this.maintenance.findById(id);
    if (!exists) {
      throw new NotFoundError("Ventana de mantenimiento no encontrada");
    }
    await this.maintenance.delete(id);

    await this.auditLog.record({
      actorId,
      action: "MAINTENANCE_DELETE",
      targetType: "maintenance-window",
      targetIds: [id],
      metadata: { name: exists.name },
    });
  }
}
