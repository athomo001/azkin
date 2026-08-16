// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface ThemeModeSettingsDoc {
  disabledModeIds: string[];
  updatedById: Types.ObjectId;
  updatedAt: Date;
}

// Documento único (singleton) identificado por un _id fijo conocido — distinto del de
// TlsConfig (...001), AppSmtpSettings (...002), MonitoringEngineSettings (...003) y
// FederationSettings (...004).
export const THEME_MODE_SETTINGS_SINGLETON_ID = "000000000000000000000005";

const themeModeSettingsSchema = new Schema<ThemeModeSettingsDoc>(
  {
    disabledModeIds: { type: [String], default: [] },
    updatedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true }, versionKey: false },
);

export const ThemeModeSettingsModel = model<ThemeModeSettingsDoc>(
  "ThemeModeSettings",
  themeModeSettingsSchema,
);
