// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMaintenanceRepository, UpdateMaintenanceWindowData } from "../../ports/repositories/maintenance-repository";
import { IMaintenanceWindow } from "../../../domain/entities/maintenance-window";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para editar una ventana de mantenimiento (alcance, fechas, nombre/descripción).
 * Una ventana ya cerrada no puede editarse — crear una nueva en su lugar.
 */
export class UpdateMaintenanceWindowUseCase {
  constructor(private readonly maintenance: IMaintenanceRepository) {}

  async execute(id: string, data: UpdateMaintenanceWindowData): Promise<IMaintenanceWindow> {
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
    return updated;
  }
}
