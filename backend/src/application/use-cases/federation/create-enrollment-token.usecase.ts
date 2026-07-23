// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";
import { IFederationEnrollmentTokenRepository } from "../../ports/repositories/federation-enrollment-token-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";

const TOKEN_TTL_MS = 20 * 60 * 1000; // 20 minutos

export interface CreateEnrollmentTokenInput {
  actorId: string;
  /** URL pública por la que esta instancia es alcanzable (la escribe el propio Admin). */
  ownUrl: string;
}

export interface CreateEnrollmentTokenOutput {
  /** Código opaco (base64url de `{ url, token }`) que el Admin de la otra instancia pega una
   * sola vez para unirse — el Admin solo copia "un código", no dos datos separados. */
  code: string;
  expiresAt: Date;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Genera un token de enrollment de un solo uso para invitar a otra instancia Azkin a federarse
 * (AZ-049). Mismo patrón que `RequestPasswordResetUseCase`: solo se persiste el hash SHA-256 y
 * la expiración; el token crudo se devuelve una única vez y nunca se guarda en texto plano.
 */
export class CreateEnrollmentTokenUseCase {
  constructor(
    private readonly tokens: IFederationEnrollmentTokenRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: CreateEnrollmentTokenInput): Promise<CreateEnrollmentTokenOutput> {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await this.tokens.create({ tokenHash, createdById: input.actorId, expiresAt });

    const code = Buffer.from(JSON.stringify({ url: input.ownUrl, token })).toString("base64url");

    await this.auditLog.record({
      actorId: input.actorId,
      action: "FEDERATION_TOKEN_CREATED",
      targetType: "federation-enrollment-token",
    });

    return { code, expiresAt };
  }
}
