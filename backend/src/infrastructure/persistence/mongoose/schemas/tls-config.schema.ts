// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface TlsConfigDoc {
  certPem: string;
  keyPemEncrypted: string;
  chainPem?: string;
  port: number;
  httpRedirect: boolean;
  updatedById: Types.ObjectId;
  updatedAt: Date;
}

// Documento único (singleton) identificado por un _id fijo conocido.
export const TLS_CONFIG_SINGLETON_ID = "000000000000000000000001";

const tlsConfigSchema = new Schema<TlsConfigDoc>(
  {
    certPem: { type: String, required: true },
    keyPemEncrypted: { type: String, required: true },
    chainPem: { type: String, default: null },
    port: { type: Number, required: true, min: 1, max: 65535 },
    httpRedirect: { type: Boolean, default: false },
    updatedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true }, versionKey: false },
);

export const TlsConfigModel = model<TlsConfigDoc>("TlsConfig", tlsConfigSchema);
