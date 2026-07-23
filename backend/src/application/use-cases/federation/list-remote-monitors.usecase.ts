// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederationClient, RemoteMonitorSummary } from "../../ports/services/federation-client";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

/**
 * Lado que **inicia** la exploración (AZ-049, slice 2): un Admin, desde `/settings`, pide ver los
 * monitores de una instancia ya federada, para decidir cuál vincular con un monitor local.
 */
export class ListRemoteMonitorsUseCase {
  constructor(
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly client: IFederationClient,
    private readonly decryptSecret: (encrypted: string, key: string) => string,
    private readonly encryptionKey: string,
  ) {}

  async execute(federatedInstanceId: string): Promise<RemoteMonitorSummary[]> {
    const instance = await this.federatedInstances.findById(federatedInstanceId);
    if (!instance) {
      throw new NotFoundError("Instancia federada no encontrada");
    }
    if (instance.status !== "enrolled") {
      throw new ValidationError("La federación con esta instancia está revocada");
    }

    return this.client.listRemoteMonitors({
      remoteUrl: instance.remoteUrl,
      secret: this.decryptSecret(instance.remoteSecretEncrypted, this.encryptionKey),
    });
  }
}
