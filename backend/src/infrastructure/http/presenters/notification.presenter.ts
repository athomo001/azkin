// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { INotification } from "../../../domain/entities/notification";
import { SENSITIVE_NOTIFICATION_CONFIG_KEYS, maskSecret } from "../../../application/services/notification-secrets";

/**
 * AZ-010: presenta un canal de notificación enmascarando sus campos sensibles
 * (`webhookUrl`/`botToken`/`smtpPassword`), igual que `passwordHash` nunca sale del dominio.
 * El enmascarado conserva los últimos 4 caracteres para que el admin identifique cuál es cuál
 * sin exponer el secreto completo. `UpdateNotificationUseCase` reconoce este formato para no
 * sobrescribir el valor real si el campo llega sin cambios desde el formulario de edición.
 */
export function toNotificationResponse(notification: INotification) {
  const maskedConfig: Record<string, unknown> = { ...notification.config };
  for (const key of SENSITIVE_NOTIFICATION_CONFIG_KEYS) {
    const value = maskedConfig[key];
    if (typeof value === "string" && value.length > 0) {
      maskedConfig[key] = maskSecret(value);
    }
  }

  return {
    id: notification.id,
    name: notification.name,
    type: notification.type,
    config: maskedConfig,
    isActive: notification.isActive,
    events: notification.events,
    templates: notification.templates,
  };
}
