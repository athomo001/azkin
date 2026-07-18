// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { AlertEventType } from "../value-objects/alert-event-type";

export type NotificationType = "email" | "slack" | "telegram" | "discord" | "webhook";

export interface INotificationTemplate {
  subject?: string; // usado solo por el canal email
  body: string; // texto (slack/discord/telegram/email) o JSON (webhook), con variables {{var}}
}

/**
 * Entidad pura que representa una configuración de canal de notificación (Notification) en el dominio de Azkin.
 * Define la estructura y el proveedor de notificaciones al cual se enviarán alertas sobre los monitores asociados.
 */
export interface INotification {
  id: string;
  userId: string; // ID del administrador propietario del canal
  name: string; // Nombre descriptivo del canal (ej. "Slack Equipo Web")
  type: NotificationType; // Tipo de canal de alertas
  config: Record<string, unknown>; // Parámetros específicos de configuración (tokens, urls, credenciales, etc.)
  isActive: boolean; // Indica si el canal de notificación se encuentra activo
  events: AlertEventType[] | "all"; // Enrutamiento: "all" o lista explícita de eventos suscritos
  templates: Partial<Record<AlertEventType, INotificationTemplate>>; // Plantillas por evento (AZ-004)
  createdAt: Date;
  updatedAt: Date;
}
