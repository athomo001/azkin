// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface MonitoringEngineSettingsDoc {
  degradedLatencyMs: number | null;
  acceleratedIntervalSeconds: number | null;
  updatedById: Types.ObjectId;
  updatedAt: Date;
}

// Documento único (singleton) identificado por un _id fijo conocido — distinto del de
// TlsConfig (...001) y AppSmtpSettings (...002).
export const MONITORING_ENGINE_SETTINGS_SINGLETON_ID = "000000000000000000000003";

const monitoringEngineSettingsSchema = new Schema<MonitoringEngineSettingsDoc>(
  {
    degradedLatencyMs: { type: Number, default: null },
    acceleratedIntervalSeconds: { type: Number, default: null },
    updatedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true }, versionKey: false },
);

export const MonitoringEngineSettingsModel = model<MonitoringEngineSettingsDoc>(
  "MonitoringEngineSettings",
  monitoringEngineSettingsSchema,
);
