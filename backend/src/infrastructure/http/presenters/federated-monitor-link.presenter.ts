// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";

export function toFederatedMonitorLinkResponse(link: IFederatedMonitorLink) {
  return {
    id: link.id,
    localMonitorId: link.localMonitorId,
    federatedInstanceId: link.federatedInstanceId,
    remoteMonitorId: link.remoteMonitorId,
    remoteMonitorLabel: link.remoteMonitorLabel,
    createdAt: link.createdAt.toISOString(),
    lastSyncedAt: link.lastSyncedAt ? link.lastSyncedAt.toISOString() : null,
  };
}
