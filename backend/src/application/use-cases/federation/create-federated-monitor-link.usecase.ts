// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

export interface CreateFederatedMonitorLinkInput {
  actorId: string;
  localMonitorId: string;
  federatedInstanceId: string;
  remoteMonitorId: string;
  remoteMonitorLabel: string;
}

/**
 * Crea el vínculo "este monitor local = ese monitor remoto" (AZ-049, slice 2). No requiere avisar
 * al peer — el sondeo posterior simplemente pide heartbeats de `remoteMonitorId` por id, y el
 * peer responde a cualquier instancia federada que se lo pida (ver modelo de confianza en
 * ISSUES.md AZ-049).
 */
export class CreateFederatedMonitorLinkUseCase {
  constructor(
    private readonly links: IFederatedMonitorLinkRepository,
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly monitors: IMonitorRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: CreateFederatedMonitorLinkInput): Promise<IFederatedMonitorLink> {
    const monitor = await this.monitors.findById(input.localMonitorId);
    if (!monitor) {
      throw new NotFoundError("Monitor local no encontrado");
    }

    const instance = await this.federatedInstances.findById(input.federatedInstanceId);
    if (!instance) {
      throw new NotFoundError("Instancia federada no encontrada");
    }
    if (instance.status !== "enrolled") {
      throw new ValidationError("La federación con esta instancia está revocada");
    }

    const link = await this.links.create({
      localMonitorId: input.localMonitorId,
      federatedInstanceId: input.federatedInstanceId,
      remoteMonitorId: input.remoteMonitorId,
      remoteMonitorLabel: input.remoteMonitorLabel,
      createdById: input.actorId,
    });

    await this.auditLog.record({
      actorId: input.actorId,
      action: "FEDERATION_MONITOR_LINK_CREATED",
      targetType: "federated-monitor-link",
      targetIds: [link.id],
      metadata: { localMonitorId: input.localMonitorId, federatedInstanceId: input.federatedInstanceId },
    });

    // Desencadenar la sincronización inmediata si se proporciona la función de sync
    if (this.triggerSync) {
      this.triggerSync().catch(() => {
        // Silenciar errores asíncronos para no bloquear la respuesta de la API al crear el vínculo
      });
    }

    return link;
  }

  private triggerSync?: () => Promise<void>;

  setSyncTrigger(fn: () => Promise<void>): void {
    this.triggerSync = fn;
  }
}
