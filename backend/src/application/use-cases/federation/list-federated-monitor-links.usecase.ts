// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";

export class ListFederatedMonitorLinksUseCase {
  constructor(private readonly links: IFederatedMonitorLinkRepository) {}

  async execute(localMonitorId?: string): Promise<IFederatedMonitorLink[]> {
    if (localMonitorId) {
      return this.links.findByLocalMonitorId(localMonitorId);
    }
    return this.links.findAll();
  }
}
