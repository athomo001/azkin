import { IUserRepository } from "../../ports/repositories/user-repository";
import { IPasswordHasher, ITokenService } from "../../ports/services/security";
import { EmailTakenError } from "../../../domain/errors/domain-error";
import { AuthOutput } from "../../dtos/auth-output";

export interface RegisterInput {
  email: string;
  password: string;
}

/**
 * Caso de uso para registrar un nuevo usuario administrador (Admin) en el sistema.
 * El registro público está restringido a administradores.
 */
export class RegisterUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService,
  ) {}

  async execute(input: RegisterInput): Promise<AuthOutput> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new EmailTakenError();
    }

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({ email: input.email, passwordHash });
    const token = this.tokens.sign(user.id, user.role, user.adminId);

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
