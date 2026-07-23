// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstance } from "../../../domain/entities/federated-instance";

export function toFederatedInstanceResponse(instance: IFederatedInstance) {
  return {
    id: instance.id,
    label: instance.label,
    remoteUrl: instance.remoteUrl,
    status: instance.status,
    createdAt: instance.createdAt.toISOString(),
    revokedAt: instance.revokedAt ? instance.revokedAt.toISOString() : null,
    lastSuccessfulSyncAt: instance.lastSuccessfulSyncAt ? instance.lastSuccessfulSyncAt.toISOString() : null,
    notifiedDown: instance.notifiedDown,
  };
}
