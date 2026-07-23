// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

export class DeleteFederatedMonitorLinkUseCase {
  constructor(
    private readonly links: IFederatedMonitorLinkRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, id: string): Promise<void> {
    const link = await this.links.findById(id);
    if (!link) {
      throw new NotFoundError("Vínculo de monitoreo no encontrado");
    }

    await this.links.delete(id);

    await this.auditLog.record({
      actorId,
      action: "FEDERATION_MONITOR_LINK_DELETED",
      targetType: "federated-monitor-link",
      targetIds: [id],
    });
  }
}
