// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  CreateNotificationData,
  INotificationRepository,
} from "../../ports/repositories/notification-repository";
import { INotification } from "../../../domain/entities/notification";

/**
 * Caso de uso para registrar un nuevo canal de alertas (Notification) en el sistema.
 */
export class CreateNotificationUseCase {
  constructor(private readonly notifications: INotificationRepository) {}

  async execute(input: CreateNotificationData): Promise<INotification> {
    return this.notifications.create(input);
  }
}
