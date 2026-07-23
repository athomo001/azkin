// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Revoca una instancia federada: deja de aceptar sus requests de inmediato (el estado se
 * comprueba en Mongo en cada llamada, no depende de nada a nivel de TLS/CA — ver AZ-049).
 */
export class RevokeFederatedInstanceUseCase {
  constructor(
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, id: string): Promise<IFederatedInstance> {
    const instance = await this.federatedInstances.revoke(id);
    if (!instance) {
      throw new NotFoundError("Instancia federada no encontrada");
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
