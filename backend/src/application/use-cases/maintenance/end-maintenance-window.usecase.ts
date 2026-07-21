// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IMaintenanceWindow } from "../../../domain/entities/maintenance-window";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para cerrar manualmente una ventana de mantenimiento (inmediata, o una
 * programada que se quiere terminar antes de tiempo). Setea `closedAt`, lo que reactiva
 * las alertas del alcance cubierto en el siguiente chequeo.
 */
export class EndMaintenanceWindowUseCase {
  constructor(
    private readonly maintenance: IMaintenanceRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, id: string): Promise<IMaintenanceWindow> {
    const existing = await this.maintenance.findById(id);
    if (!existing) {
      throw new NotFoundError("Ventana de mantenimiento no encontrada");
    }
    if (existing.closedAt !== null) {
      throw new ValidationError("La ventana de mantenimiento ya está cerrada");
    }

    const closed = await this.maintenance.close(id);
    if (!closed) {
      throw new NotFoundError("Ventana de mantenimiento no encontrada");
    }

    await this.auditLog.record({
      actorId,
      action: "MAINTENANCE_END",
      targetType: "maintenance-window",
      targetIds: [id],
      metadata: { name: existing.name },
    });

    return closed;
  }
}
