// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IFederatedHeartbeatRepository } from "../../ports/repositories/federated-heartbeat-repository";
import { IFederationClient } from "../../ports/services/federation-client";
import { IMailer } from "../../ports/services/mailer";
import { ResolveDefaultAlertRecipients } from "../../services/resolve-default-alert-recipients";
import { getErrorMessage } from "../../services/get-error-message";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { logger } from "../../../infrastructure/logger";
import { FEDERATION_REPORTING_THRESHOLD_SECONDS } from "./federation-limits";

/**
 * Tick de sondeo periódico entre instancias federadas (AZ-049, slice 2) — mirror exacto de
 * `RunScheduledReportsUseCase`: itera con try/catch por elemento, un peer caído no detiene el
 * resto. Solo procesa instancias que tengan al menos un `FederatedMonitorLink` (si no hay nada
 * vinculado, no hay nada que sondear ni de qué "reportar").
 */
export class RunFederationSyncUseCase {
  constructor(
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly links: IFederatedMonitorLinkRepository,
    private readonly federatedHeartbeats: IFederatedHeartbeatRepository,
    private readonly client: IFederationClient,
    private readonly mailer: IMailer,
    private readonly defaultAlertRecipients: ResolveDefaultAlertRecipients,
    private readonly decryptSecret: (encrypted: string, key: string) => string,
    private readonly encryptionKey: string,
  ) {}

  async execute(): Promise<void> {
    const instances = await this.federatedInstances.findAllActive();
    for (const instance of instances) {
      try {
        await this.processInstance(instance);
      } catch (err) {
        logger.error(`[Federation] Fallo inesperado sincronizando "${instance.label}": ${getErrorMessage(err)}`);
      }
    }
  }

  private async processInstance(instance: IFederatedInstance): Promise<void> {
    const links = await this.links.findByFederatedInstanceId(instance.id);
    if (links.length === 0) return;

    let reachedThisTick = false;
    const secret = this.decryptSecret(instance.remoteSecretEncrypted, this.encryptionKey);

    for (const link of links) {
      try {
        const heartbeats = await this.client.syncHeartbeats(
          { remoteUrl: instance.remoteUrl, secret },
          link.remoteMonitorId,
          link.lastSyncedAt,
        );
        reachedThisTick = true;

        if (heartbeats.length > 0) {
          await this.federatedHeartbeats.insertMany(
            heartbeats.map((hb) => ({
              federatedMonitorLinkId: link.id,
              timestamp: new Date(hb.timestamp),
              status: hb.status,
              ping: hb.ping,
            })),
          );
        }
        await this.links.markSynced(link.id, new Date());
      } catch (err) {
        logger.error(
          `[Federation] Fallo al sincronizar el vínculo ${link.id} ("${instance.label}"): ${getErrorMessage(err)}`,
        );
      }
    }

    if (reachedThisTick) {
      await this.federatedInstances.markSyncSuccess(instance.id, new Date());
      if (instance.notifiedDown) {
        await this.notifyHealthTransition(instance, true);
        await this.federatedInstances.setNotifiedDown(instance.id, false);
      }
      return;
    }

    const lastSeen = instance.lastSuccessfulSyncAt ?? instance.createdAt;
    const secondsSinceLastSeen = (Date.now() - lastSeen.getTime()) / 1000;
    if (secondsSinceLastSeen > FEDERATION_REPORTING_THRESHOLD_SECONDS && !instance.notifiedDown) {
      await this.notifyHealthTransition(instance, false);
      await this.federatedInstances.setNotifiedDown(instance.id, true);
    }
  }

  private async notifyHealthTransition(instance: IFederatedInstance, recovered: boolean): Promise<void> {
    const recipients = await this.defaultAlertRecipients.resolve();
    if (recipients.length === 0) return;

    const subject = recovered
      ? `Federación recuperada — ${instance.label}`
      : `Federación sin reportar — ${instance.label}`;
    const minutes = Math.round(FEDERATION_REPORTING_THRESHOLD_SECONDS / 60);
    const text = recovered
      ? `La instancia federada "${instance.label}" volvió a reportar correctamente.`
      : `La instancia federada "${instance.label}" no reporta desde hace más de ${minutes} minutos.`;

    for (const to of recipients) {
      await this.mailer.send({ to, subject, text });
    }
  }
}
