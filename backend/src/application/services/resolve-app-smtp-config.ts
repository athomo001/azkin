// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { ISmtpConfigResolver, SmtpConfig } from "../ports/services/smtp-config-resolver";
import { IAppSmtpSettingsRepository } from "../ports/repositories/app-smtp-settings-repository";
import { INotificationRepository } from "../ports/repositories/notification-repository";
import { EmailConfig } from "../../domain/entities/notification";
import { logger } from "../../infrastructure/logger";

/**
 * Resuelve el SMTP efectivo de la aplicación: si hay un canal de notificación de tipo "email"
 * seleccionado (`IAppSmtpSettingsRepository`), reutiliza su configuración SMTP; si no hay ninguno
 * seleccionado, o el canal ya no existe / cambió de tipo, cae a las variables de entorno
 * `AZKIN_SMTP_*` recibidas por constructor.
 */
export class ResolveAppSmtpConfig implements ISmtpConfigResolver {
  constructor(
    private readonly appSmtpSettings: IAppSmtpSettingsRepository,
    private readonly notifications: INotificationRepository,
    private readonly envSmtpConfig: SmtpConfig,
  ) {}

  async resolve(): Promise<SmtpConfig> {
    const settings = await this.appSmtpSettings.getActive();
    if (!settings?.notificationChannelId) {
      return this.envSmtpConfig;
    }

    const channel = await this.notifications.findById(settings.notificationChannelId);
    if (!channel || channel.type !== "email") {
      logger.warn(
        `[SMTP de Aplicación] El canal seleccionado (${settings.notificationChannelId}) ya no existe o no es de tipo email — usando AZKIN_SMTP_* como respaldo.`,
      );
      return this.envSmtpConfig;
    }

    const conf = channel.config as unknown as EmailConfig;
    return {
      host: conf.smtpHost,
      port: conf.smtpPort ? parseInt(String(conf.smtpPort), 10) : undefined,
      secure: !!conf.smtpSecure,
      user: conf.smtpUsername,
      password: conf.smtpPassword,
      from: conf.smtpFrom,
    };
  }
}
