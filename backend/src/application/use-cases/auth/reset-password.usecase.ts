// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IPasswordHasher } from "../../ports/services/security";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { ValidationError } from "../../../domain/errors/domain-error";

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Caso de uso para completar la recuperación de contraseña con un token válido y vigente.
 */
export class ResetPasswordUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    const tokenHash = hashToken(input.token);
    const user = await this.users.findByValidResetTokenHash(tokenHash);
    if (!user) {
      throw new ValidationError("El enlace de recuperación es inválido o ha expirado");
    }

    const passwordHash = await this.hasher.hash(input.newPassword);
    await this.users.changePassword(user.id, passwordHash);
    await this.users.clearPasswordResetToken(user.id);

    await this.auditLog.record({
      actorId: user.id,
      action: "PASSWORD_RESET_COMPLETED",
      targetType: "user",
      targetIds: [user.id],
    });
  }
}
