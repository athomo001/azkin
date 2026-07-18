// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IBackupRepository } from "../../ports/repositories/backup-repository";
import { IBackup } from "../../../domain/entities/backup";

/**
 * Caso de uso para listar los respaldos persistidos de un usuario (metadatos + payload).
 */
export class ListBackupsUseCase {
  constructor(private readonly backups: IBackupRepository) {}

  async execute(userId: string): Promise<IBackup[]> {
    return this.backups.findAllByUser(userId);
  }
}
