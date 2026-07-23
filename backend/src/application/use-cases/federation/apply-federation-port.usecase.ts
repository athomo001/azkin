// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederationPortSettingsRepository } from "../../ports/repositories/federation-port-settings-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederationServerManager } from "../../ports/services/federation-server-manager";
import { IFederationIdentityService } from "../../ports/services/federation-identity";
import { IFederationPortSettings } from "../../../domain/entities/federation-port-settings";
import { ValidationError } from "../../../domain/errors/domain-error";
import { getErrorMessage } from "../../services/get-error-message";

export interface ApplyFederationPortInput {
  actorId: string;
  port: number;
}

export interface ApplyFederationPortOutput {
  settings: IFederationPortSettings;
}

/**
 * Caso de uso para cambiar en caliente el puerto del listener mTLS de federación — mismo patrón
 * que `ApplyTlsConfigUseCase` (AZ-006): recarga el listener real primero, y solo si arrancó
 * correctamente en el puerto nuevo se persiste el override; si falla, el listener anterior sigue
 * activo y no se guarda nada. `getOwnServerCredentials()` ya lanza `ValidationError` si falta
 * `AZKIN_TLS_ENCRYPTION_KEY` (ver `FederationIdentityService`), así que no se duplica esa validación acá.
 */
export class ApplyFederationPortUseCase {
  constructor(
    private readonly portSettings: IFederationPortSettingsRepository,
    private readonly auditLog: IAuditLogRepository,
    private readonly federationServerManager: IFederationServerManager,
    private readonly federationIdentityService: IFederationIdentityService,
  ) {}

  async execute(input: ApplyFederationPortInput): Promise<ApplyFederationPortOutput> {
    const credentials = await this.federationIdentityService.getOwnServerCredentials();

    let applyError: string | undefined;
    try {
      await this.federationServerManager.reload({
        certPem: credentials.certPem,
        keyPem: credentials.keyPem,
        port: input.port,
      });
    } catch (err) {
      applyError = getErrorMessage(err);
    }

    await this.auditLog.record({
      actorId: input.actorId,
      action: "FEDERATION_PORT_UPDATE",
      targetType: "federation-port-settings",
      metadata: { port: input.port, success: !applyError, error: applyError },
    });

    if (applyError) {
      throw new ValidationError(
        `No se pudo levantar el listener de federación en el puerto ${input.port}: ${applyError}. El servicio anterior sigue activo.`,
      );
    }

    const settings = await this.portSettings.upsert({ port: input.port, updatedById: input.actorId });
    return { settings };
  }
}
