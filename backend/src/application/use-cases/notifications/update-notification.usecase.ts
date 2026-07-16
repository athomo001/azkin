import {
  INotificationRepository,
  UpdateNotificationData,
} from "../../ports/repositories/notification-repository";
import { INotification } from "../../../domain/entities/notification";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para actualizar la configuración de un canal de notificación.
 */
export class UpdateNotificationUseCase {
  constructor(private readonly notifications: INotificationRepository) {}

  async execute(userId: string, id: string, data: UpdateNotificationData): Promise<INotification> {
    const updated = await this.notifications.update(userId, id, data);
    if (!updated) {
      throw new NotFoundError("Canal de notificación no encontrado");
    }
    return updated;
  }
}
