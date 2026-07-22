// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IAppSmtpSettingsRepository } from "../ports/repositories/app-smtp-settings-repository";
import { INotificationRepository } from "../ports/repositories/notification-repository";
import { EmailConfig } from "../../domain/entities/notification";

/**
 * Resuelve el "correo global de alertas" para `recipientMode: "default_alert_email"` (AZ-045).
 * No existe un concepto de destinatario global único en el sistema — los destinatarios viven por
 * canal de notificación. Se reutiliza el mismo canal ya referenciado por `IAppSmtpSettings`
 * (Settings → TLS/Sistema → "SMTP de Aplicación"), tomando el/los destinatario(s) configurados en
 * ESE canal — mismo criterio de resolución que `ResolveAppSmtpConfig` usa para el transporte SMTP.
 */
export class ResolveDefaultAlertRecipients {
  constructor(
    private readonly appSmtpSettings: IAppSmtpSettingsRepository,
    private readonly notifications: INotificationRepository,
  ) {}

  async resolve(): Promise<string[]> {
    const settings = await this.appSmtpSettings.getActive();
    if (!settings?.notificationChannelId) return [];

    const channel = await this.notifications.findById(settings.notificationChannelId);
    if (!channel || channel.type !== "email") return [];

    const conf = channel.config as unknown as EmailConfig;
    if (typeof conf.email === "string" && conf.email.trim().length > 0) return [conf.email.trim()];
    if (conf.emailRecipient) return [conf.emailRecipient];
    if (Array.isArray(conf.emails)) return conf.emails;
    return [];
  }
}
