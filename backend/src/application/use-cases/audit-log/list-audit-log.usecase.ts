// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IAuditLog } from "../../../domain/entities/audit-log";
import { IUser } from "../../../domain/entities/user";

export interface AuditLogEntryOutput extends IAuditLog {
  actorEmail: string;
}

/**
 * Caso de uso para listar el historial de auditoría reciente.
 * Sin aislamiento por tenant: cualquier Admin puede revisar acciones de otros admins
 * (ej. "quién borró estos monitores", "quién cambió el certificado TLS"), y también ve
 * las acciones generadas por Viewers (ej. su propio login).
 */
export class ListAuditLogUseCase {
  constructor(
    private readonly auditLog: IAuditLogRepository,
    private readonly users: IUserRepository,
  ) {}

  async execute(limit = 50): Promise<AuditLogEntryOutput[]> {
    const entries = await this.auditLog.listAll(limit);

    // findById cubre tanto admins como viewers (a diferencia de findAllAdmins(), que dejaba
    // resolver mal cualquier entrada generada por un Viewer, ej. LOGIN_SUCCESS/LOGIN_FAILED).
    const actorIds = [...new Set(entries.map((e) => e.actorId).filter((id): id is string => !!id))];
    const actors = await Promise.all(actorIds.map((id) => this.users.findById(id)));
    const emailByActorId = new Map(
      actors.filter((u): u is IUser => !!u).map((u) => [u.id, u.email ?? u.username ?? "Desconocido"]),
    );

    return entries.map((entry) => ({
      ...entry,
      actorEmail: entry.actorId
        ? (emailByActorId.get(entry.actorId) ?? "Usuario eliminado")
        : String(entry.metadata?.attemptedIdentifier ?? "Desconocido"),
    }));
  }
}
