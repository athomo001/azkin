// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";
import { IFederationEnrollmentTokenRepository } from "../../ports/repositories/federation-enrollment-token-repository";
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { QuotaExceededError, ValidationError } from "../../../domain/errors/domain-error";
import { MAX_FEDERATED_INSTANCES } from "./federation-limits";

export interface AcceptEnrollmentInput {
  token: string;
  callerLabel: string;
  callerUrl: string;
  callerSecret: string;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Lado que **recibe** una solicitud de enrollment (AZ-049): la llama el backend de la instancia
 * remota que se está uniendo, nunca un usuario con sesión — su única prueba de autorización es
 * el token de un solo uso, igual nivel de protección que `/auth/reset-password`. Por eso NO
 * recibe `actorId` de una sesión: el "actor" de la auditoría es quien generó el token
 * originalmente (`consumeValid` lo devuelve). El secreto compartido (`callerSecret`) lo generó el
 * lado que se une (`JoinFederationUseCase`) — acá solo se cifra y se guarda, no se genera nada
 * propio ni se devuelve nada al llamador.
 */
export class AcceptEnrollmentUseCase {
  constructor(
    private readonly tokens: IFederationEnrollmentTokenRepository,
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly auditLog: IAuditLogRepository,
    private readonly encryptSecret: (secret: string, key: string) => string,
    private readonly encryptionKey: string,
  ) {}

  async execute(input: AcceptEnrollmentInput): Promise<void> {
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

    const instance = await this.federatedInstances.create({
      label: input.callerLabel,
      remoteUrl: input.callerUrl,
      remoteSecretEncrypted: this.encryptSecret(input.callerSecret, this.encryptionKey),
      createdById: consumed.createdById,
    });

    await this.auditLog.record({
      actorId: consumed.createdById,
      action: "FEDERATION_INSTANCE_ENROLLED",
      targetType: "federated-instance",
      targetIds: [instance.id],
    });
  }
}
