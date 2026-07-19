// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { EmailTakenError, NotFoundError } from "../../../domain/errors/domain-error";
import { IUser } from "../../../domain/entities/user";

export interface UpdateAdminInput {
  id: string;
  email: string;
}

/**
 * Caso de uso para que un Admin autenticado edite el email de otra cuenta Admin.
 */
export class UpdateAdminUseCase {
  constructor(private readonly users: IUserRepository) {}

  async execute(input: UpdateAdminInput): Promise<IUser> {
    const existing = await this.users.findByEmail(input.email);
    if (existing && existing.id !== input.id) {
      throw new EmailTakenError();
    }

    const updated = await this.users.updateAdminEmail(input.id, input.email);
    if (!updated) {
      throw new NotFoundError("Administrador no encontrado");
    }
    return updated;
  }
}
