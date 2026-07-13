import { IUserRepository } from "../../ports/repositories/user-repository";
import { IPasswordHasher, ITokenService } from "../../ports/services/security";
import { InvalidCredentialsError } from "../../../domain/errors/domain-error";
import { AuthOutput } from "../../dtos/auth-output";

export interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService,
  ) {}

  async execute(input: LoginInput): Promise<AuthOutput> {
    const user = await this.users.findByEmail(input.email);
    // Mensaje genérico: no revela si el email existe (anti-enumeración).
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const matches = await this.hasher.compare(input.password, user.passwordHash);
    if (!matches) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokens.sign(user.id);
    return { token, user: { id: user.id, email: user.email } };
  }
}
