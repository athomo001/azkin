// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para eliminar una ventana de mantenimiento (ej. una programada que nunca
 * llegó a activarse, o limpieza de histórico).
 */
export class DeleteMaintenanceWindowUseCase {
  constructor(private readonly maintenance: IMaintenanceRepository) {}

  async execute(id: string): Promise<void> {
    const exists = await this.maintenance.findById(id);
    if (!exists) {
      throw new NotFoundError("Ventana de mantenimiento no encontrada");
    }
    await this.maintenance.delete(id);
  }
}
