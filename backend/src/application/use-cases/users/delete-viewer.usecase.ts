// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para que un administrador elimine una cuenta de tipo Viewer
 * asociada a su perfil, denegando accesos a futuro.
 */
export class DeleteViewerUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(adminId: string, id: string): Promise<void> {
    const deleted = await this.users.deleteViewer(adminId, id);
    if (!deleted) {
      throw new NotFoundError("Viewer no encontrado");
    }

    await this.auditLog.record({
      actorId: adminId,
      action: "VIEWER_DELETE",
      targetType: "user",
      targetIds: [id],
    });
  }
}
