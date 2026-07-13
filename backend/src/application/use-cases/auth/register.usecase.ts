import { IUserRepository } from "../../ports/repositories/user-repository";
import { IPasswordHasher, ITokenService } from "../../ports/services/security";
import { EmailTakenError } from "../../../domain/errors/domain-error";
import { AuthOutput } from "../../dtos/auth-output";

export interface RegisterInput {
  email: string;
  password: string;
}

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
    const token = this.tokens.sign(user.id);

    return { token, user: { id: user.id, email: user.email } };
  }
}
