// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  INotificationRepository,
  UpdateNotificationData,
} from "../../ports/repositories/notification-repository";
import { INotification } from "../../../domain/entities/notification";
import { NotFoundError } from "../../../domain/errors/domain-error";
import { SENSITIVE_NOTIFICATION_CONFIG_KEYS, SECRET_MASK_PREFIX } from "../../services/notification-secrets";

/**
 * Caso de uso para actualizar la configuración de un canal de notificación.
 * Los campos sensibles (`webhookUrl`/`botToken`/`smtpPassword`) llegan enmascarados desde el
 * formulario de edición si el admin no los tocó (AZ-010): si el valor recibido tiene el formato
 * de máscara, se conserva el valor real ya persistido en vez de sobrescribirlo con el placeholder.
 */
export class UpdateNotificationUseCase {
  constructor(private readonly notifications: INotificationRepository) {}

  async execute(id: string, data: UpdateNotificationData): Promise<INotification> {
    const existing = await this.notifications.findById(id);
    if (!existing) {
      throw new NotFoundError("Canal de notificación no encontrado");
    }

    let config = data.config;
    if (config) {
      config = { ...config };
      for (const key of SENSITIVE_NOTIFICATION_CONFIG_KEYS) {
        const incoming = config[key];
        if (typeof incoming === "string" && incoming.startsWith(SECRET_MASK_PREFIX)) {
          config[key] = existing.config[key];
        }
      }
    }

    const updated = await this.notifications.update(id, { ...data, config });
    if (!updated) {
      throw new NotFoundError("Canal de notificación no encontrado");
    }
    return updated;
  }
}
