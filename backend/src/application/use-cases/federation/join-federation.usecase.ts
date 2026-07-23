// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederationIdentityService } from "../../ports/services/federation-identity";
import { IFederationClient } from "../../ports/services/federation-client";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { getCertificateFingerprint } from "../../services/get-certificate-fingerprint";
import { getErrorMessage } from "../../services/get-error-message";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { QuotaExceededError, ValidationError } from "../../../domain/errors/domain-error";
import { MAX_FEDERATED_INSTANCES } from "./federation-limits";

export interface JoinFederationInput {
  actorId: string;
  /** Código pegado por el Admin, generado por `CreateEnrollmentTokenUseCase` en la otra instancia. */
  code: string;
  /** Cómo esta instancia va a referirse al par nuevo (ej. "China-VPS1"). */
  peerLabel: string;
  /** Cómo esta instancia se identifica a sí misma frente al par. */
  ownLabel: string;
}

export interface JoinFederationOutput {
  instance: IFederatedInstance;
}

/**
 * Lado que **inicia** el enrollment (AZ-049): decodifica el código pegado por el Admin, llama de
 * salida a la instancia remota con el token, y si acepta, persiste el registro simétrico local.
 * Caso borde aceptado (no se resuelve con 2PC — sería sobreingeniería a 5 instancias máximo): si
 * la red falla justo después de que la remota acepta pero antes de recibir la respuesta, la
 * remota queda con un registro "huérfano" que se resuelve revocándolo manualmente.
 */
export class JoinFederationUseCase {
  constructor(
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly identity: IFederationIdentityService,
    private readonly client: IFederationClient,
    private readonly auditLog: IAuditLogRepository,
    private readonly resolveOwnFederationPort: () => Promise<number>,
    private readonly resolveOwnUrl: () => Promise<string | null>,
  ) {}

  async execute(input: JoinFederationInput): Promise<JoinFederationOutput> {
    const activeCount = await this.federatedInstances.countActive();
    if (activeCount >= MAX_FEDERATED_INSTANCES) {
      throw new QuotaExceededError(
        `Se ha superado el límite máximo de ${MAX_FEDERATED_INSTANCES} instancias federadas`,
      );
    }

    const ownUrl = await this.resolveOwnUrl();
    if (!ownUrl) {
      throw new ValidationError(
        "Configura la dirección pública de esta instancia en /settings → Multi-Región antes de unirte a una federación",
      );
    }

    const decoded = this.decodeCode(input.code);

    const ownIdentity = await this.identity.getOrCreateOwnCertificate();
    const ownFederationPort = await this.resolveOwnFederationPort();

    const result = await this.client.requestEnrollment({
      remoteUrl: decoded.url,
      token: decoded.token,
      callerCertPem: ownIdentity.certPem,
      callerLabel: input.ownLabel,
      callerUrl: ownUrl,
      callerFederationPort: ownFederationPort,
    });

    let fingerprint: string;
    try {
      fingerprint = getCertificateFingerprint(result.ownCertPem);
    } catch {
      throw new ValidationError("El certificado devuelto por la instancia remota no tiene un formato válido");
    }

    const instance = await this.federatedInstances.create({
      label: input.peerLabel,
      remoteUrl: decoded.url,
      remoteFederationPort: result.ownFederationPort,
      peerCertFingerprint: fingerprint,
      createdById: input.actorId,
    });

    await this.auditLog.record({
      actorId: input.actorId,
      action: "FEDERATION_INSTANCE_ENROLLED",
      targetType: "federated-instance",
      targetIds: [instance.id],
    });

    return { instance };
  }

  private decodeCode(code: string): { url: string; token: string } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(Buffer.from(code, "base64url").toString("utf8"));
    } catch (err) {
      throw new ValidationError(`El código de enrollment no tiene un formato válido: ${getErrorMessage(err)}`);
    }

    const { url, token } = (parsed ?? {}) as { url?: unknown; token?: unknown };
    if (typeof url !== "string" || typeof token !== "string" || !url || !token) {
      throw new ValidationError("El código de enrollment no tiene un formato válido");
    }

    return { url, token };
  }
}
