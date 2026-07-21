// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { CreateMaintenanceWindowData, IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { IMaintenanceWindow } from "../../../domain/entities/maintenance-window";

/**
 * Caso de uso para crear una ventana de mantenimiento (inmediata o programada).
 * La validación de fechas según el modo vive en el schema Zod del borde HTTP
 * (infrastructure/http/schemas/maintenance.schema.ts).
 */
export class CreateMaintenanceWindowUseCase {
  constructor(private readonly maintenance: IMaintenanceRepository) {}

  async execute(input: CreateMaintenanceWindowData): Promise<IMaintenanceWindow> {
    return this.maintenance.create(input);
  }
}
