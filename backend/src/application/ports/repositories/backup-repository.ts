// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { BackupStrategy, IBackup, IBackupPayload } from "../../../domain/entities/backup";

export interface CreateBackupData {
  userId: string;
  strategy: BackupStrategy;
  payload: IBackupPayload;
}

/**
 * Puerto (interfaz) para la persistencia de respaldos de configuración de monitores.
 */
export interface IBackupRepository {
  create(data: CreateBackupData): Promise<IBackup>;
  findAllByUser(userId: string): Promise<IBackup[]>;
  findById(userId: string, id: string): Promise<IBackup | null>;
  /** Elimina todos los respaldos previos del usuario. Devuelve la cantidad eliminada. */
  deleteAllByUser(userId: string): Promise<number>;
}
