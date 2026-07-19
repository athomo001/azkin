// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { INotification, INotificationTemplate, NotificationType } from "../../../domain/entities/notification";
import { AlertEventType } from "../../../domain/value-objects/alert-event-type";

export interface CreateNotificationData {
  userId: string; // ID del administrador propietario
  name: string;
  type: NotificationType;
  config: Record<string, unknown>;
  isActive?: boolean;
  events?: AlertEventType[] | "all";
  templates?: Partial<Record<AlertEventType, INotificationTemplate>>;
}

export interface UpdateNotificationData {
  name?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
  events?: AlertEventType[] | "all";
  templates?: Partial<Record<AlertEventType, INotificationTemplate>>;
}

/**
 * Puerto (interfaz) para el repositorio que gestionará la persistencia de canales de alertas (Notification).
 * Define las operaciones CRUD desacopladas de la infraestructura subyacente.
 */
/**
 * Sin aislamiento por tenant entre Admins (spec/03-modelo-datos.md §8): todos los canales de
 * notificación son un único pool global. `userId` en el documento es solo trazabilidad de creación.
 */
export interface INotificationRepository {
  create(data: CreateNotificationData): Promise<INotification>;
  findAll(): Promise<INotification[]>;
  findById(id: string): Promise<INotification | null>;
  update(id: string, data: UpdateNotificationData): Promise<INotification | null>;
  delete(id: string): Promise<boolean>;
}
