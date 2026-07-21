// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  CreateNotificationData,
  INotificationRepository,
} from "../../ports/repositories/notification-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { INotification } from "../../../domain/entities/notification";

/**
 * Caso de uso para registrar un nuevo canal de alertas (Notification) en el sistema.
 */
export class CreateNotificationUseCase {
  constructor(
    private readonly notifications: INotificationRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: CreateNotificationData): Promise<INotification> {
    const notification = await this.notifications.create(input);

    await this.auditLog.record({
      actorId: input.userId,
      action: "NOTIFICATION_CREATE",
      targetType: "notification",
      targetIds: [notification.id],
      metadata: { name: notification.name, type: notification.type },
    });

    return notification;
  }
}
