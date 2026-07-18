// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";
import { INotificationTemplate, NotificationType } from "../../../../domain/entities/notification";
import { AlertEventType } from "../../../../domain/value-objects/alert-event-type";

export interface NotificationDoc {
  userId: Types.ObjectId; // Referencia al usuario administrador propietario
  name: string;
  type: NotificationType;
  config: Record<string, unknown>; // Parámetros específicos del canal (URLs, tokens, SMTP, etc.)
  isActive: boolean;
  events: AlertEventType[] | "all";
  templates: Partial<Record<AlertEventType, INotificationTemplate>>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["email", "slack", "telegram", "discord", "webhook"], required: true },
    config: { type: Schema.Types.Mixed, default: {} }, // Almacenamiento flexible dependiente del tipo
    isActive: { type: Boolean, default: true },
    events: { type: Schema.Types.Mixed, default: "all" }, // "all" | AlertEventType[]
    templates: { type: Schema.Types.Mixed, default: {} }, // Partial<Record<AlertEventType, template>>
  },
  { timestamps: true, versionKey: false },
);

export const NotificationModel = model<NotificationDoc>("Notification", notificationSchema);
