// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";
import { NotFoundError } from "../../../domain/errors/domain-error";

export interface RegisterPeerMonitorLinkInput {
  /** Id del monitor tal cual existe EN ESTA instancia (la que recibe el registro). */
  localMonitorId: string;
  /** Id del monitor recién creado/vinculado del lado del par que llama. */
  remoteMonitorId: string;
  /** Nombre simple del monitor remoto — la etiqueta final la arma esta instancia con SU PROPIA
   * etiqueta para ese par, nunca confiando en cómo el par se autodescribe. */
  remoteMonitorName: string;
}

/**
 * Lado que **recibe** el registro recíproco de un vínculo (AZ-050): cuando el par ya se auto-vinculó
 * con un monitor nuestro (nos lo pidió vía `/federation/peer/monitors`), nos avisa acá para que
 * nosotros también tengamos nuestro propio `FederatedMonitorLink` apuntando de vuelta — así la vista
 * "Por región/Combinado" aparece en ambos lados sin depender de que nuestro propio ciclo de
 * auto-vinculación alcance a correr después del suyo (la carrera entre ambos callbacks
 * independientes es justo lo que dejaba el gráfico asimétrico: solo del lado que importó).
 * `req.federatedInstance` ya viene resuelto y autenticado por `verifyPeerSecret` antes de llegar acá.
 */
export class RegisterPeerMonitorLinkUseCase {
  constructor(
    private readonly links: IFederatedMonitorLinkRepository,
    private readonly monitors: IMonitorRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(caller: IFederatedInstance, input: RegisterPeerMonitorLinkInput): Promise<IFederatedMonitorLink> {
    const monitor = await this.monitors.findById(input.localMonitorId);
    if (!monitor) {
      throw new NotFoundError("Monitor local no encontrado");
    }

    const link = await this.links.create({
      localMonitorId: input.localMonitorId,
      federatedInstanceId: caller.id,
      remoteMonitorId: input.remoteMonitorId,
      remoteMonitorLabel: `${input.remoteMonitorName} (${caller.label})`,
      createdById: caller.createdById,
    });

    await this.auditLog.record({
      actorId: caller.createdById,
      action: "FEDERATION_MONITOR_LINK_CREATED",
      targetType: "federated-monitor-link",
      targetIds: [link.id],
      metadata: { localMonitorId: input.localMonitorId, federatedInstanceId: caller.id, registeredByPeer: true },
    });

    return link;
  }
}
