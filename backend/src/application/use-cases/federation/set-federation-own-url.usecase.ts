// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederationSettingsRepository } from "../../ports/repositories/federation-settings-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { normalizeInstanceUrl, isInsecureFederationUrl } from "../../services/normalize-instance-url";
import { IFederationSettings } from "../../../domain/entities/federation-settings";
import { logger } from "../../../infrastructure/logger";

export interface SetFederationOwnUrlInput {
  actorId: string;
  ownUrl: string;
}

/**
 * Caso de uso para guardar, una única vez, la dirección pública (IP o dominio) por la que esta
 * instancia es alcanzable — se reutiliza automáticamente al invitar y al unirse a una federación,
 * en vez de pedirla a mano en cada una (ver `CreateEnrollmentTokenUseCase`/`JoinFederationUseCase`).
 * No dispara ningún reload de servidor: es solo un dato informativo que se envía al par.
 */
export class SetFederationOwnUrlUseCase {
  constructor(
    private readonly settings: IFederationSettingsRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: SetFederationOwnUrlInput): Promise<IFederationSettings> {
    const ownUrl = normalizeInstanceUrl(input.ownUrl);
    // AZ-066: HTTP plano es una opción deliberadamente soportada (no se bloquea), pero el Admin
    // debe saber que el secreto compartido de federación viaja sin cifrar hacia esa dirección.
    if (isInsecureFederationUrl(ownUrl)) {
      logger.warn(
        `[Federation] La dirección propia configurada (${ownUrl}) usa HTTP sin cifrar — el secreto compartido de federación viajará en texto plano hacia esta instancia. Se recomienda HTTPS nativo (ver /settings → TLS/Sistema) en producción.`,
      );
    }
    const settings = await this.settings.upsert({ ownUrl, updatedById: input.actorId });

    await this.auditLog.record({
      actorId: input.actorId,
      action: "FEDERATION_OWN_URL_SET",
      targetType: "federation-settings",
      metadata: { ownUrl },
    });

    return settings;
  }
}
