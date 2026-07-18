// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Registro de auditoría mínimo para acciones administrativas sensibles
 * (borrado masivo de monitores, reemplazo de respaldos, cambios de TLS, etc.).
 */
export interface IAuditLog {
  id: string;
  actorId: string; // ID del admin que ejecutó la acción
  action: string; // ej. "MONITORS_BULK_DELETE", "BACKUP_REPLACE", "TLS_CONFIG_UPDATE"
  targetType: string; // ej. "monitor", "backup", "tls-config"
  targetIds?: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
