// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IAuditLog } from "../../../domain/entities/audit-log";

export interface RecordAuditLogData {
  actorId: string;
  action: string;
  targetType: string;
  targetIds?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Puerto (interfaz) para la persistencia de auditoría mínima de acciones administrativas.
 */
export interface IAuditLogRepository {
  record(data: RecordAuditLogData): Promise<IAuditLog>;
  listRecent(actorId: string, limit?: number): Promise<IAuditLog[]>;
}
