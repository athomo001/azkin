// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { IFederationClient } from "../../ports/services/federation-client";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Revoca una instancia federada: cambia su estado a "revoked" de inmediato e intenta notificar
 * al par remoto vía P2P para que también actualice su estado (AZ-049 / AZ-050).
 */
export class RevokeFederatedInstanceUseCase {
  constructor(
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly auditLog: IAuditLogRepository,
    private readonly client?: IFederationClient,
    private readonly decryptSecret?: (encrypted: string, key: string) => string,
    private readonly encryptionKey?: string,
  ) {}

  async execute(actorId: string, id: string): Promise<IFederatedInstance> {
    const existing = await this.federatedInstances.findById(id);
    if (!existing) {
      throw new NotFoundError("Instancia federada no encontrada");
    }

    const instance = await this.federatedInstances.revoke(id);
    if (!instance) {
      throw new NotFoundError("Instancia federada no encontrada");
    }

    // Si se dispone de cliente y claves, enviar notificación saliente P2P al par remoto
    if (this.client && this.decryptSecret && this.encryptionKey && existing.remoteSecretEncrypted) {
      try {
        const secret = this.decryptSecret(existing.remoteSecretEncrypted, this.encryptionKey);
        this.client.notifyRevocation({ remoteUrl: existing.remoteUrl, secret }).catch(() => {});
      } catch {
        // Ignorar fallos de descifrado o red al notificar al par
      }
    }

    await this.auditLog.record({
      actorId,
      action: "FEDERATION_INSTANCE_REVOKED",
      targetType: "federated-instance",
      targetIds: [id],
    });

    return instance;
  }
}
