// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IUser } from "../../../domain/entities/user";

/**
 * Caso de uso para que un administrador obtenga el listado completo de Viewers
 * que ha creado en el sistema.
 */
export class ListViewersUseCase {
  constructor(private readonly users: IUserRepository) {}

  async execute(adminId: string): Promise<IUser[]> {
    return this.users.findAllViewers(adminId);
  }
}
