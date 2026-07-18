// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export type BackupStrategy = "accumulate" | "replace";

export interface IBackupPayload {
  version: string;
  exportedAt: string;
  monitors: unknown[];
}

/**
 * Snapshot de respaldo persistido de la configuración de monitores de un Admin.
 */
export interface IBackup {
  id: string;
  userId: string;
  strategy: BackupStrategy;
  payload: IBackupPayload;
  createdAt: Date;
}
