// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IPasswordHasher } from "../../ports/services/security";
import { EmailTakenError } from "../../../domain/errors/domain-error";
import { IUser } from "../../../domain/entities/user";

export interface CreateAdminInput {
  email: string;
  password: string;
}

/**
 * Caso de uso para que un Admin autenticado cree otra cuenta Admin.
 * A diferencia de RegisterUseCase (auto-bootstrap del primer admin, público y sin auth),
 * este caso de uso vive detrás de requireRole("admin") y no tiene límite de cantidad.
 */
export class CreateAdminUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
  ) {}

  async execute(input: CreateAdminInput): Promise<IUser> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new EmailTakenError();
    }

    const passwordHash = await this.hasher.hash(input.password);
    return this.users.create({ email: input.email, passwordHash });
  }
}
