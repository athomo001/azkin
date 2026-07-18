// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IUser } from "../../../domain/entities/user";

/**
 * Caso de uso para que un Admin autenticado vea el listado de todas las cuentas Admin
 * del sistema (sin aislamiento por tenant, ver spec/03-modelo-datos.md §2).
 */
export class ListAdminsUseCase {
  constructor(private readonly users: IUserRepository) {}

  async execute(): Promise<IUser[]> {
    return this.users.findAllAdmins();
  }
}
