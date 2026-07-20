// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface AppSmtpSettingsDoc {
  notificationChannelId: Types.ObjectId | null;
  updatedById: Types.ObjectId;
  updatedAt: Date;
}

// Documento único (singleton) identificado por un _id fijo conocido — distinto del de TlsConfig.
export const APP_SMTP_SETTINGS_SINGLETON_ID = "000000000000000000000002";

const appSmtpSettingsSchema = new Schema<AppSmtpSettingsDoc>(
  {
    notificationChannelId: { type: Schema.Types.ObjectId, ref: "Notification", default: null },
    updatedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true }, versionKey: false },
);

export const AppSmtpSettingsModel = model<AppSmtpSettingsDoc>("AppSmtpSettings", appSmtpSettingsSchema);
