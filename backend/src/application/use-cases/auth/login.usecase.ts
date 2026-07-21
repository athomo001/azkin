// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IPasswordHasher, ITokenService } from "../../ports/services/security";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { AccountBlockedError, InvalidCredentialsError } from "../../../domain/errors/domain-error";
import { AuthOutput } from "../../dtos/auth-output";

export interface LoginInput {
  identifier: string;
  password: string;
}

/** Expiración del refresh token (7 días), acorde a spec/04-contratos-api.md §1.1. */
export const REFRESH_TOKEN_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

/**
 * Caso de uso para autenticar un usuario en el sistema.
 * Valida credenciales de Admins y Viewers de forma centralizada sin revelar la existencia de correos.
 */
export class LoginUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: LoginInput): Promise<AuthOutput> {
    const user = await this.users.findByIdentifier(input.identifier);
    // Mensaje genérico: no revela si el identificador existe (anti-enumeración).
    if (!user) {
      await this.auditLog.record({
        actorId: null,
        action: "LOGIN_FAILED",
        targetType: "user",
        metadata: { attemptedIdentifier: input.identifier, reason: "unknown_identifier" },
      });
      throw new InvalidCredentialsError();
    }

    const matches = await this.hasher.compare(input.password, user.passwordHash);
    if (!matches) {
      await this.auditLog.record({
        actorId: user.id,
        action: "LOGIN_FAILED",
        targetType: "user",
        targetIds: [user.id],
        metadata: { attemptedIdentifier: input.identifier, reason: "wrong_password" },
      });
      throw new InvalidCredentialsError();
    }

    // Se verifica después de confirmar la contraseña: evita revelar el estado de bloqueo
    // a alguien que aún no demostró conocer la contraseña correcta (anti-enumeración).
    if (user.isBlocked) {
      await this.auditLog.record({
        actorId: user.id,
        action: "LOGIN_BLOCKED",
        targetType: "user",
        targetIds: [user.id],
        metadata: { attemptedIdentifier: input.identifier },
      });
      throw new AccountBlockedError();
    }

    // Sesiones TV/Kiosko usan un token de larga duración (1 año) en vez del expiresIn por defecto.
    const tvExpiresIn = user.isTvSessionEnabled ? 31536000 : undefined;
    const token = this.tokens.sign(user.id, user.role, user.adminId, user.permissions, tvExpiresIn);
    // Refresh token de larga duración, persistido solo como cookie HttpOnly por el controller.
    const refreshToken = this.tokens.sign(
      user.id,
      user.role,
      user.adminId,
      user.permissions,
      tvExpiresIn ?? REFRESH_TOKEN_EXPIRES_IN_SECONDS,
    );

    await this.auditLog.record({
      actorId: user.id,
      action: "LOGIN_SUCCESS",
      targetType: "user",
      targetIds: [user.id],
    });

    return {
      token,
      refreshToken,
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
