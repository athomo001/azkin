// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IPasswordHasher, ITokenService } from "../../ports/services/security";
import { EmailTakenError, ForbiddenError } from "../../../domain/errors/domain-error";
import { AuthOutput } from "../../dtos/auth-output";

export interface RegisterInput {
  email: string;
  password: string;
}

/**
 * Caso de uso para registrar el primer usuario administrador (Admin) del sistema (auto-bootstrap).
 * Una vez que existe al menos un admin, este endpoint queda deshabilitado (AZ-002): las altas
 * posteriores de admins/viewers se hacen desde la gestión de usuarios de un admin autenticado,
 * o mediante el seeder de arranque (AZKIN_FIRST_ADMIN_*).
 */
export class RegisterUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService,
  ) {}

  async execute(input: RegisterInput): Promise<AuthOutput> {
    const adminCount = await this.users.countAdmins();
    if (adminCount > 0) {
      throw new ForbiddenError("El registro público está deshabilitado: ya existe un administrador configurado");
    }

    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new EmailTakenError();
    }

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({ email: input.email, passwordHash });
    const token = this.tokens.sign(user.id, user.role, user.adminId, user.permissions);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        adminId: user.adminId,
        permissions: user.permissions,
        isTvSessionEnabled: user.isTvSessionEnabled ?? false,
        preferences: {
          nyanCatMode: user.preferences?.nyanCatMode ?? false,
        },
      },
    };
  }
}
