// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { ForbiddenError, NotFoundError } from "../../../domain/errors/domain-error";
import { IUser } from "../../../domain/entities/user";

/**
 * Caso de uso para que un Admin autenticado bloquee o desbloquee otra cuenta Admin.
 * Un admin no puede bloquearse a sí mismo (evita quedar sin acceso).
 */
export class SetAdminBlockedUseCase {
  constructor(private readonly users: IUserRepository) {}

  async execute(actorId: string, targetId: string, isBlocked: boolean): Promise<IUser> {
    if (actorId === targetId) {
      throw new ForbiddenError("No puedes bloquear tu propia cuenta");
    }

    const updated = await this.users.setAdminBlocked(targetId, isBlocked);
    if (!updated) {
      throw new NotFoundError("Administrador no encontrado");
    }
    return updated;
  }
}
