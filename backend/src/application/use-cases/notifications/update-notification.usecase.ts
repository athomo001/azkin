// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  INotificationRepository,
  UpdateNotificationData,
} from "../../ports/repositories/notification-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { INotification } from "../../../domain/entities/notification";
import { NotFoundError } from "../../../domain/errors/domain-error";
import { SENSITIVE_NOTIFICATION_CONFIG_KEYS, SECRET_MASK_PREFIX, maskSecret } from "../../services/notification-secrets";
import { diffFields } from "../../services/diff-fields";

/** Enmascara los valores de las claves sensibles de `config` para que nunca queden en texto plano en el historial de auditoría. */
function maskSensitiveConfig(config: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...config };
  for (const key of SENSITIVE_NOTIFICATION_CONFIG_KEYS) {
    const value = masked[key];
    if (typeof value === "string" && value) {
      masked[key] = maskSecret(value);
    }
  }
  return masked;
}

/**
 * Caso de uso para actualizar la configuración de un canal de notificación.
 * Los campos sensibles (`webhookUrl`/`botToken`/`smtpPassword`) llegan enmascarados desde el
 * formulario de edición si el admin no los tocó: si el valor recibido tiene el formato
 * de máscara, se conserva el valor real ya persistido en vez de sobrescribirlo con el placeholder.
 */
export class UpdateNotificationUseCase {
  constructor(
    private readonly notifications: INotificationRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, id: string, data: UpdateNotificationData): Promise<INotification> {
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

    const changes = diffFields(
      { ...existing, config: maskSensitiveConfig(existing.config) },
      { ...data, config: config ? maskSensitiveConfig(config) : undefined },
    );

    await this.auditLog.record({
      actorId,
      action: "NOTIFICATION_UPDATE",
      targetType: "notification",
      targetIds: [id],
      metadata: { changes },
    });

    return updated;
  }
}
