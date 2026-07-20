// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export type BackupStrategy = "accumulate" | "replace";

/** Cuenta Admin tal como viaja dentro de un respaldo completo — incluye `passwordHash`. */
export interface IBackupAdmin {
  email: string;
  username?: string;
  passwordHash: string;
  isBlocked?: boolean;
  preferences?: { nyanCatMode: boolean };
}

/**
 * Viewer tal como viaja dentro de un respaldo completo. `adminIdentifier` referencia al admin
 * propietario por email (o username si no tiene email) en vez de por ObjectId — el ObjectId
 * original no sirve al restaurar en una instancia donde los admins se recrean con IDs nuevos.
 */
export interface IBackupViewer {
  email?: string;
  username?: string;
  passwordHash: string;
  adminIdentifier: string;
  permissions: { type: "all" | "group" | "monitor"; value?: string }[];
  isTvSessionEnabled?: boolean;
}

export interface IBackupPayload {
  version: string;
  exportedAt: string;
  monitors: unknown[];
  /**
   * Secciones agregadas en la v2.0 del formato de respaldo — opcionales para poder seguir
   * leyendo archivos v1.0 ya descargados (solo monitores) sin que la importación falle.
   * Contienen credenciales (`passwordHash`, y `tlsConfig.keyPemEncrypted`): un respaldo
   * completo debe tratarse como secreto, no solo como configuración.
   */
  notifications?: unknown[];
  admins?: IBackupAdmin[];
  viewers?: IBackupViewer[];
  tlsConfig?: unknown | null;
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
