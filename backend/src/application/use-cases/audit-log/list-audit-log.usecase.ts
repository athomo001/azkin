// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IAuditLog } from "../../../domain/entities/audit-log";

export interface AuditLogEntryOutput extends IAuditLog {
  actorEmail: string;
}

/**
 * Caso de uso para listar el historial de auditoría reciente (AZ-030).
 * Sin aislamiento por tenant: cualquier Admin puede revisar acciones de otros admins
 * (ej. "quién borró estos monitores", "quién cambió el certificado TLS").
 */
export class ListAuditLogUseCase {
  constructor(
    private readonly auditLog: IAuditLogRepository,
    private readonly users: IUserRepository,
  ) {}

  async execute(limit = 50): Promise<AuditLogEntryOutput[]> {
    const [entries, admins] = await Promise.all([
      this.auditLog.listAll(limit),
      this.users.findAllAdmins(),
    ]);

    const emailByActorId = new Map(admins.map((a) => [a.id, a.email ?? "Desconocido"]));

    return entries.map((entry) => ({
      ...entry,
      actorEmail: emailByActorId.get(entry.actorId) ?? "Administrador eliminado",
    }));
  }
}
