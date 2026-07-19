// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository, CreateMonitorData } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { QuotaExceededError } from "../../../domain/errors/domain-error";
import crypto from "crypto";

export interface ImportBackupInput {
  userId: string;
  monitors: Omit<CreateMonitorData, "userId" | "pushToken">[];
}

export interface ImportBackupOutput {
  importedCount: number;
  updatedCount: number;
}

/**
 * Caso de uso para importar la configuración de monitores de un archivo.
 * Sanitiza los registros e inyecta la cuota límite del Admin.
 */
export class ImportBackupUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly scheduler: IScheduler,
  ) {}

  async execute(input: ImportBackupInput): Promise<ImportBackupOutput> {
    const existing = await this.monitors.findAll();
    const existingCount = existing.length;

    // Mapa para búsqueda rápida
    const existingMap = new Map(existing.map((m) => [`${m.name}-${m.target}`, m]));

    let importedCount = 0;
    let updatedCount = 0;

    // Determina cuántos monitores nuevos se van a insertar
    let newCount = 0;
    for (const item of input.monitors) {
      const key = `${item.name}-${item.target}`;
      if (!existingMap.has(key)) {
        newCount++;
      }
    }

    if (existingCount + newCount > 50) {
      throw new QuotaExceededError(
        `La importación excede el límite de 50 monitores. Actuales: ${existingCount}, Nuevos a crear: ${newCount}`,
      );
    }

    for (const item of input.monitors) {
      const key = `${item.name}-${item.target}`;
      const found = existingMap.get(key);

      if (found) {
        // Actualiza el monitor existente
        const updated = await this.monitors.update(found.id, {
          ...item,
        });
        if (updated) {
          if (updated.isActive) {
            this.scheduler.reschedule(updated);
          } else {
            this.scheduler.unschedule(updated.id);
          }
          updatedCount++;
        }
      } else {
        // Crea uno nuevo (sanitizado)
        let pushToken: string | undefined;
        if (item.type === "push") {
          pushToken = crypto.randomUUID();
        }

        const created = await this.monitors.create({
          ...item,
          userId: input.userId,
          pushToken,
        });

        if (created.isActive) {
          this.scheduler.schedule(created);
        }
        importedCount++;
      }
    }

    return { importedCount, updatedCount };
  }
}
