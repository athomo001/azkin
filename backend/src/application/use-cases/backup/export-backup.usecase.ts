import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IMonitor } from "../../../domain/entities/monitor";

export interface ExportBackupOutput {
  version: string;
  exportedAt: string;
  monitors: Omit<IMonitor, "id" | "userId" | "createdAt" | "updatedAt">[];
}

/**
 * Caso de uso para exportar la configuración de todos los monitores asociados
 * al usuario autenticado.
 */
export class ExportBackupUseCase {
  constructor(private readonly monitors: IMonitorRepository) {}

  async execute(userId: string): Promise<ExportBackupOutput> {
    const list = await this.monitors.findAllByUser(userId);

    // Sanitiza excluyendo IDs y datos auto-generados de persistencia
    const mapped = list.map((m) => {
      const { id, userId: _, createdAt, updatedAt, ...rest } = m;
      return rest;
    });

    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      monitors: mapped,
    };
  }
}
