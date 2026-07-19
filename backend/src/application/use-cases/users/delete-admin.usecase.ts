// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { ForbiddenError, NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para que un Admin autenticado elimine otra cuenta Admin.
 * Un admin no puede eliminarse a sí mismo (evita dejar el sistema sin administradores activos
 * de forma accidental desde su propia sesión).
 */
export class DeleteAdminUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, targetId: string): Promise<void> {
    if (actorId === targetId) {
      throw new ForbiddenError("No puedes eliminar tu propia cuenta");
    }

    const deleted = await this.users.deleteAdmin(targetId);
    if (!deleted) {
      throw new NotFoundError("Administrador no encontrado");
    }

    await this.auditLog.record({
      actorId,
      action: "ADMIN_DELETE",
      targetType: "user",
      targetIds: [targetId],
    });
  }
}
