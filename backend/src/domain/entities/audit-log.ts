// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Registro de auditoría mínimo para acciones administrativas sensibles
 * (borrado masivo de monitores, reemplazo de respaldos, cambios de TLS, etc.).
 */
export interface IAuditLog {
  id: string;
  // Null cuando el intento no corresponde a ningún usuario existente (ej. LOGIN_FAILED con un
  // identificador desconocido) — no hay a quién referenciar.
  actorId: string | null;
  action: string; // ej. "MONITORS_BULK_DELETE", "BACKUP_REPLACE", "TLS_CONFIG_UPDATE"
  targetType: string; // ej. "monitor", "backup", "tls-config"
  targetIds?: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
