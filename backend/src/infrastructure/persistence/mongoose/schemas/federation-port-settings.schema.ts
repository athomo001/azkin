// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface FederationPortSettingsDoc {
  port: number;
  updatedById: Types.ObjectId;
  updatedAt: Date;
}

// Documento único (singleton) identificado por un _id fijo conocido — distinto de TlsConfig
// (...0001), AppSmtpSettings/FederationIdentity (...0002) y MonitoringEngineSettings (...0003).
export const FEDERATION_PORT_SETTINGS_SINGLETON_ID = "000000000000000000000004";

const federationPortSettingsSchema = new Schema<FederationPortSettingsDoc>(
  {
    port: { type: Number, required: true, min: 1, max: 65535 },
    updatedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true }, versionKey: false },
);

export const FederationPortSettingsModel = model<FederationPortSettingsDoc>(
  "FederationPortSettings",
  federationPortSettingsSchema,
);
