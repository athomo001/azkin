import { INotification, NotificationType } from "../../../domain/entities/notification";

export interface CreateNotificationData {
  userId: string; // ID del administrador propietario
  name: string;
  type: NotificationType;
  config: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateNotificationData {
  name?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

/**
 * Puerto (interfaz) para el repositorio que gestionará la persistencia de canales de alertas (Notification).
 * Define las operaciones CRUD desacopladas de la infraestructura subyacente.
 */
export interface INotificationRepository {
  create(data: CreateNotificationData): Promise<INotification>;
  findAllByUser(userId: string): Promise<INotification[]>;
  findById(userId: string, id: string): Promise<INotification | null>;
  update(userId: string, id: string, data: UpdateNotificationData): Promise<INotification | null>;
  delete(userId: string, id: string): Promise<boolean>;
}
