import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { INotification } from "../../../domain/entities/notification";

/**
 * Caso de uso para que un administrador liste todos sus canales de alertas.
 */
export class ListNotificationsUseCase {
  constructor(private readonly notifications: INotificationRepository) {}

  async execute(userId: string): Promise<INotification[]> {
    return this.notifications.findAllByUser(userId);
  }
}
