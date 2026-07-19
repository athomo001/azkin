// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IBackupRepository } from "../../ports/repositories/backup-repository";
import { IBackup } from "../../../domain/entities/backup";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para obtener el payload completo de un respaldo específico (descarga).
 */
export class GetBackupUseCase {
  constructor(private readonly backups: IBackupRepository) {}

  async execute(id: string): Promise<IBackup> {
    const backup = await this.backups.findById(id);
    if (!backup) {
      throw new NotFoundError("Respaldo no encontrado");
    }
    return backup;
  }
}
