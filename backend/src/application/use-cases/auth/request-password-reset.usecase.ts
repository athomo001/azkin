// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IMailer } from "../../ports/services/mailer";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutos

export interface RequestPasswordResetInput {
  email: string;
  appUrl?: string;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Caso de uso para solicitar la recuperación de contraseña.
 * Responde siempre de forma genérica (anti-enumeración): el llamador nunca sabe si el
 * correo existe o no. Si existe, genera un token de un solo uso con expiración corta.
 */
export class RequestPasswordResetUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly mailer: IMailer,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: RequestPasswordResetInput): Promise<void> {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      return; // Anti-enumeración: no se revela si el correo existe.
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    await this.users.setPasswordResetToken(user.id, tokenHash, expiresAt);

    const resetLink = input.appUrl
      ? `${input.appUrl.replace(/\/$/, "")}/reset-password?token=${token}`
      : undefined;

    await this.mailer.send({
      to: input.email,
      subject: "Recuperación de contraseña — Azkin",
      text: resetLink
        ? `Solicitaste recuperar tu contraseña. Este enlace vence en 30 minutos:\n${resetLink}\n\nSi no fuiste tú, ignora este mensaje.`
        : `Solicitaste recuperar tu contraseña. Tu token (vence en 30 minutos): ${token}\n\nSi no fuiste tú, ignora este mensaje.`,
    });

    await this.auditLog.record({
      actorId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      targetType: "user",
      targetIds: [user.id],
    });
  }
}
