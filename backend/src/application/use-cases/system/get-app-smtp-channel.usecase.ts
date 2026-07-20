// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IAppSmtpSettingsRepository } from "../../ports/repositories/app-smtp-settings-repository";
import { INotificationRepository } from "../../ports/repositories/notification-repository";

export interface AppSmtpChannelOutput {
  notificationChannelId: string | null;
  channelName: string | null;
}

/**
 * Caso de uso para consultar qué canal de notificación (si alguno) está siendo reutilizado como
 * SMTP de aplicación — para que la UI de `/settings` muestre la selección actual.
 */
export class GetAppSmtpChannelUseCase {
  constructor(
    private readonly appSmtpSettings: IAppSmtpSettingsRepository,
    private readonly notifications: INotificationRepository,
  ) {}

  async execute(): Promise<AppSmtpChannelOutput> {
    const settings = await this.appSmtpSettings.getActive();
    if (!settings?.notificationChannelId) {
      return { notificationChannelId: null, channelName: null };
    }

    const channel = await this.notifications.findById(settings.notificationChannelId);
    return {
      notificationChannelId: settings.notificationChannelId,
      channelName: channel?.name ?? null,
    };
  }
}
