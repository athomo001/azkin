// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { NotFoundError, QuotaExceededError } from "../../../domain/errors/domain-error";
import { MAX_FEDERATED_INSTANCES } from "./federation-limits";

/**
 * Caso de uso para reactivar (des-revocar) una instancia federada (AZ-050).
 * Cambia el estado de la instancia de "revoked" a "enrolled", verificando previamente que
 * no se supere el límite de 5 instancias federadas activas simultáneas.
 */
export class ReactivateFederatedInstanceUseCase {
  constructor(
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, instanceId: string): Promise<IFederatedInstance> {
    const existing = await this.federatedInstances.findById(instanceId);
    if (!existing) {
      throw new NotFoundError("Instancia federada no encontrada");
    }

    if (existing.status === "enrolled") {
      return existing;
    }

    const activeCount = await this.federatedInstances.countActive();
    if (activeCount >= MAX_FEDERATED_INSTANCES) {
      throw new QuotaExceededError(
        `Se ha superado el límite máximo de ${MAX_FEDERATED_INSTANCES} instancias federadas activas`,
      );
    }

    const reactivated = await this.federatedInstances.reactivate(instanceId);
    if (!reactivated) {
      throw new NotFoundError("Instancia federada no encontrada");
    }

    await this.auditLog.record({
      actorId,
      action: "FEDERATION_INSTANCE_REACTIVATED",
      targetType: "federated-instance",
      targetIds: [reactivated.id],
    });

    return reactivated;
  }
}
