// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { IMaintenanceWindow } from "../../../domain/entities/maintenance-window";

/**
 * Caso de uso para listar todas las ventanas de mantenimiento (activas e históricas),
 * sin aislamiento por tenant — mismo criterio que canales de notificación.
 */
export class ListMaintenanceWindowsUseCase {
  constructor(private readonly maintenance: IMaintenanceRepository) {}

  async execute(): Promise<IMaintenanceWindow[]> {
    return this.maintenance.findAll();
  }
}
