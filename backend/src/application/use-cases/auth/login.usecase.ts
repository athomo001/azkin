import { IUserRepository } from "../../ports/repositories/user-repository";
import { IPasswordHasher, ITokenService } from "../../ports/services/security";
import { InvalidCredentialsError } from "../../../domain/errors/domain-error";
import { AuthOutput } from "../../dtos/auth-output";

export interface LoginInput {
  identifier: string;
  password: string;
}

/**
 * Caso de uso para autenticar un usuario en el sistema.
 * Valida credenciales de Admins y Viewers de forma centralizada sin revelar la existencia de correos.
 */
export class LoginUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService,
  ) {}

  async execute(input: LoginInput): Promise<AuthOutput> {
    const user = await this.users.findByIdentifier(input.identifier);
    // Mensaje genérico: no revela si el identificador existe (anti-enumeración).
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const matches = await this.hasher.compare(input.password, user.passwordHash);
    if (!matches) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokens.sign(user.id, user.role, user.adminId);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
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
