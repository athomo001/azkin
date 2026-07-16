import { IUserRepository } from "../../ports/repositories/user-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para que un administrador elimine una cuenta de tipo Viewer
 * asociada a su perfil, denegando accesos a futuro.
 */
export class DeleteViewerUseCase {
  constructor(private readonly users: IUserRepository) {}

  async execute(adminId: string, id: string): Promise<void> {
    const deleted = await this.users.deleteViewer(adminId, id);
    if (!deleted) {
      throw new NotFoundError("Viewer no encontrado");
    }
  }
}
