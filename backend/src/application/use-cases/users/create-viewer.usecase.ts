// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IPasswordHasher } from "../../ports/services/security";
import { EmailTakenError } from "../../../domain/errors/domain-error";
import { IUser } from "../../../domain/entities/user";

export interface CreateViewerInput {
  adminId: string; // ID del administrador propietario
  username: string;
  email?: string;
  password: string;
  permissions?: IUser["permissions"];
  isTvSessionEnabled?: boolean;
}

/**
 * Caso de uso para que un Administrador cree un nuevo Viewer en el sistema,
 * asignándole credenciales y privilegios de lectura granulares.
 */
export class CreateViewerUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
  ) {}

  async execute(input: CreateViewerInput): Promise<IUser> {
    if (input.email?.trim()) {
      const existingEmail = await this.users.findByIdentifier(input.email);
      if (existingEmail) {
        throw new EmailTakenError("El correo electrónico ya está registrado");
      }
    }

    const existingUser = await this.users.findByIdentifier(input.username);
    if (existingUser) {
      throw new EmailTakenError("El nombre de usuario ya está registrado");
    }

    const passwordHash = await this.hasher.hash(input.password);
    const viewer = await this.users.createViewer({
      username: input.username,
      email: input.email?.trim() ? input.email : undefined,
      passwordHash,
      role: "viewer",
      adminId: input.adminId,
      permissions: input.permissions ?? [],
      isTvSessionEnabled: input.isTvSessionEnabled ?? false,
    });

    return viewer;
  }
}
