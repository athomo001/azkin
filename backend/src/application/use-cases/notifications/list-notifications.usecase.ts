// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { INotification } from "../../../domain/entities/notification";

/**
 * Caso de uso para listar todos los canales de alertas del sistema (sin aislamiento por tenant).
 */
export class ListNotificationsUseCase {
  constructor(private readonly notifications: INotificationRepository) {}

  async execute(): Promise<INotification[]> {
    return this.notifications.findAll();
  }
}
