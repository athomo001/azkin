import { Schema, Types, model } from "mongoose";
import { NotificationType } from "../../../../domain/entities/notification";

export interface NotificationDoc {
  userId: Types.ObjectId; // Referencia al usuario administrador propietario
  name: string;
  type: NotificationType;
  config: Record<string, unknown>; // Parámetros específicos del canal (URLs, tokens, SMTP, etc.)
  isActive: boolean;
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
  },
  { timestamps: true, versionKey: false },
);

export const NotificationModel = model<NotificationDoc>("Notification", notificationSchema);
