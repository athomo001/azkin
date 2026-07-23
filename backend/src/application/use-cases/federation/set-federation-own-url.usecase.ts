// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederationPortSettingsRepository } from "../../ports/repositories/federation-port-settings-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { normalizeInstanceUrl } from "../../services/normalize-instance-url";
import { IFederationPortSettings } from "../../../domain/entities/federation-port-settings";

export interface SetFederationOwnUrlInput {
  actorId: string;
  ownUrl: string;
}

/**
 * Caso de uso para guardar, una única vez, la dirección pública (IP o dominio) por la que esta
 * instancia es alcanzable — se reutiliza automáticamente al invitar y al unirse a una federación,
 * en vez de pedirla a mano en cada una (ver `CreateEnrollmentTokenUseCase`/`JoinFederationUseCase`).
 * No dispara ningún reload de servidor (a diferencia de `ApplyFederationPortUseCase`): es solo un
 * dato informativo que se envía al par, no algo que este backend escuche.
 */
export class SetFederationOwnUrlUseCase {
  constructor(
    private readonly portSettings: IFederationPortSettingsRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: SetFederationOwnUrlInput): Promise<IFederationPortSettings> {
    const ownUrl = normalizeInstanceUrl(input.ownUrl);
    const settings = await this.portSettings.upsert({ ownUrl, updatedById: input.actorId });

    await this.auditLog.record({
      actorId: input.actorId,
      action: "FEDERATION_OWN_URL_SET",
      targetType: "federation-port-settings",
      metadata: { ownUrl },
    });

    return settings;
  }
}
