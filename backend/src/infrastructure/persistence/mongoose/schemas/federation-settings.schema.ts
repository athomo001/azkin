// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface FederationPortSettingsDoc {
  port?: number;
  ownUrl?: string;
  updatedById: Types.ObjectId;
  updatedAt: Date;
}

// Documento único (singleton) identificado por un _id fijo conocido — distinto de TlsConfig
// (...0001), AppSmtpSettings/FederationIdentity (...0002) y MonitoringEngineSettings (...0003).
export const FEDERATION_PORT_SETTINGS_SINGLETON_ID = "000000000000000000000004";

const federationPortSettingsSchema = new Schema<FederationPortSettingsDoc>(
  {
    // Ninguno de los dos es `required`: el documento puede existir con solo uno de los dos
    // campos guardado (ver upsert() del repositorio, que hace un $set parcial).
    port: { type: Number, min: 1, max: 65535 },
    ownUrl: { type: String },
    updatedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true }, versionKey: false },
);

export const FederationPortSettingsModel = model<FederationPortSettingsDoc>(
  "FederationPortSettings",
  federationPortSettingsSchema,
);
