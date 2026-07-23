// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";
import { IFederationEnrollmentTokenRepository } from "../../ports/repositories/federation-enrollment-token-repository";
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederationIdentityService } from "../../ports/services/federation-identity";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { getCertificateFingerprint } from "../../services/get-certificate-fingerprint";
import { QuotaExceededError, ValidationError } from "../../../domain/errors/domain-error";
import { MAX_FEDERATED_INSTANCES } from "./federation-limits";

export interface AcceptEnrollmentInput {
  token: string;
  callerCertPem: string;
  callerLabel: string;
  callerUrl: string;
  callerFederationPort: number;
}

export interface AcceptEnrollmentOutput {
  ownCertPem: string;
  ownFederationPort: number;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Lado que **recibe** una solicitud de enrollment (AZ-049): la llama el backend de la instancia
 * remota que se está uniendo, nunca un usuario con sesión — su única prueba de autorización es
 * el token de un solo uso, igual nivel de protección que `/auth/reset-password`. Por eso NO
 * recibe `actorId` de una sesión: el "actor" de la auditoría es quien generó el token
 * originalmente (`consumeValid` lo devuelve).
 */
export class AcceptEnrollmentUseCase {
  constructor(
    private readonly tokens: IFederationEnrollmentTokenRepository,
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly identity: IFederationIdentityService,
    private readonly auditLog: IAuditLogRepository,
    private readonly ownFederationPort: number,
  ) {}

  async execute(input: AcceptEnrollmentInput): Promise<AcceptEnrollmentOutput> {
    const consumed = await this.tokens.consumeValid(hashToken(input.token));
    if (!consumed) {
      throw new ValidationError("El token de enrollment es inválido o ha expirado");
    }

    const activeCount = await this.federatedInstances.countActive();
    if (activeCount >= MAX_FEDERATED_INSTANCES) {
      throw new QuotaExceededError(
        `Se ha superado el límite máximo de ${MAX_FEDERATED_INSTANCES} instancias federadas`,
      );
    }

    let fingerprint: string;
    try {
      fingerprint = getCertificateFingerprint(input.callerCertPem);
    } catch {
      throw new ValidationError("El certificado presentado no tiene un formato válido");
    }

    const ownIdentity = await this.identity.getOrCreateOwnCertificate();

    const instance = await this.federatedInstances.create({
      label: input.callerLabel,
      remoteUrl: input.callerUrl,
      remoteFederationPort: input.callerFederationPort,
      peerCertFingerprint: fingerprint,
      createdById: consumed.createdById,
    });

    await this.auditLog.record({
      actorId: consumed.createdById,
      action: "FEDERATION_INSTANCE_ENROLLED",
      targetType: "federated-instance",
      targetIds: [instance.id],
    });

    return { ownCertPem: ownIdentity.certPem, ownFederationPort: this.ownFederationPort };
  }
}
