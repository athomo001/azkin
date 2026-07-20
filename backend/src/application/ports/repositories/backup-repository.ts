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
/**
 * Sin aislamiento por tenant entre Admins: los respaldos son un único historial global
 * del pool de monitores compartido (spec/03-modelo-datos.md §8).
 */
export interface IBackupRepository {
  create(data: CreateBackupData): Promise<IBackup>;
  findAll(): Promise<IBackup[]>;
  findById(id: string): Promise<IBackup | null>;
  /** Elimina todos los respaldos previos. Devuelve la cantidad eliminada. */
  deleteAll(): Promise<number>;
  /** Elimina un respaldo puntual. Devuelve false si no existía. */
  deleteById(id: string): Promise<boolean>;
}
