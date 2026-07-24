// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para aprobar una solicitud de enrolamiento entrante de una instancia federada.
 * Transiciona el estado de la instancia de 'pending_approval' a 'enrolled' tras la confirmación manual del Admin.
 */
export class ApproveFederatedInstanceUseCase {
  constructor(
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, instanceId: string): Promise<IFederatedInstance> {
    const instance = await this.federatedInstances.findById(instanceId);
    if (!instance) {
      throw new NotFoundError("Solicitud de instancia federada no encontrada");
    }

    if (instance.status !== "pending_approval") {
      throw new ValidationError("La instancia federada no se encuentra en estado pendiente de aprobación");
    }

    const approved = await this.federatedInstances.approve(instanceId);
    if (!approved) {
      throw new NotFoundError("Error al aprobar la instancia federada");
    }

    // Registrar en la bitácora de auditoría la aprobación explícita del Admin
    await this.auditLog.record({
      actorId,
      action: "FEDERATION_INSTANCE_ENROLLED",
      targetType: "federated-instance",
      targetIds: [approved.id],
    });

    return approved;
  }
}
