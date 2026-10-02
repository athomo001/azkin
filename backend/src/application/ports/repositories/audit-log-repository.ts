// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IAuditLog } from "../../../domain/entities/audit-log";
import { AlertEventType } from "../../../domain/value-objects/alert-event-type";

export interface RecordAuditLogData {
  actorId: string | null;
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
  /** Sin aislamiento por tenant — cualquier Admin puede auditar acciones de otros admins. */
  listAll(limit?: number): Promise<IAuditLog[]>;
  /** Elimina todo el historial de auditoría. Devuelve la cantidad eliminada ("Purgar instancia"). */
  deleteAll(): Promise<number>;
}

/**
 * Consulta del historial de avisos de incidente que el notificador deja en auditoría
 * (`metadata.monitorId` + `metadata.alertEvent`). Permite saber, incluso tras un reinicio, si un
 * canal tiene un aviso de caída abierto antes de enviarle un RECOVERED.
 */
export interface IIncidentAlertLookup {
  /** Último DOWN/DEGRADED/RECOVERED registrado para ese monitor en ese canal, o null si no hay. */
  findLastIncidentAlert(monitorId: string, notificationId: string): Promise<AlertEventType | null>;
}
