// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IAppSmtpSettingsRepository } from "../../ports/repositories/app-smtp-settings-repository";
import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para elegir (o quitar) qué canal de notificación de tipo "email" se reutiliza como
 * SMTP de aplicación, en vez de configurar `AZKIN_SMTP_*` por separado para lo mismo.
 * `notificationChannelId: null` revierte al SMTP por variables de entorno.
 */
export class SetAppSmtpChannelUseCase {
  constructor(
    private readonly appSmtpSettings: IAppSmtpSettingsRepository,
    private readonly notifications: INotificationRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, notificationChannelId: string | null): Promise<void> {
    if (notificationChannelId) {
      const channel = await this.notifications.findById(notificationChannelId);
      if (!channel) {
        throw new NotFoundError("Canal de notificación no encontrado");
      }
      if (channel.type !== "email") {
        throw new ValidationError("Solo un canal de tipo Email puede reutilizarse como SMTP de aplicación");
      }
    }

    await this.appSmtpSettings.upsert({ notificationChannelId, updatedById: actorId });

    await this.auditLog.record({
      actorId,
      action: "APP_SMTP_CHANNEL_SET",
      targetType: "app-smtp-settings",
      metadata: { notificationChannelId },
    });
  }
}
