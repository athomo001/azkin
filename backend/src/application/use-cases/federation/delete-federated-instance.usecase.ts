// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para eliminar permanentemente una instancia federada y sus vínculos de monitoreo (AZ-050).
 */
export class DeleteFederatedInstanceUseCase {
  constructor(
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly links: IFederatedMonitorLinkRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, instanceId: string): Promise<void> {
    const existing = await this.federatedInstances.findById(instanceId);
    if (!existing) {
      throw new NotFoundError("Instancia federada no encontrada");
    }

    // Limpiar automáticamente todos los vínculos de monitoreo asociados a esta instancia
    await this.links.deleteByFederatedInstanceId(instanceId);

    // Eliminar el registro permanente de la instancia
    await this.federatedInstances.delete(instanceId);

    await this.auditLog.record({
      actorId,
      action: "FEDERATION_INSTANCE_DELETED",
      targetType: "federated-instance",
      targetIds: [instanceId],
    });
  }
}
