// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface FederatedMonitorLinkDoc {
  localMonitorId: Types.ObjectId;
  federatedInstanceId: Types.ObjectId;
  remoteMonitorId: string;
  remoteMonitorLabel: string;
  createdById: Types.ObjectId;
  createdAt: Date;
  lastSyncedAt: Date | null;
}

const federatedMonitorLinkSchema = new Schema<FederatedMonitorLinkDoc>(
  {
    localMonitorId: { type: Schema.Types.ObjectId, ref: "Monitor", required: true },
    federatedInstanceId: { type: Schema.Types.ObjectId, ref: "FederatedInstance", required: true },
    remoteMonitorId: { type: String, required: true },
    remoteMonitorLabel: { type: String, required: true },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastSyncedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

federatedMonitorLinkSchema.index({ localMonitorId: 1 });
federatedMonitorLinkSchema.index({ federatedInstanceId: 1 });
// Evita vínculos duplicados ante enrolamientos/auto-vinculaciones concurrentes (ver AZ-050 punto 6):
// la verificación en memoria del caso de uso no alcanza cuando dos requests distintas (ej. dos
// admins, o el callback de enrollment y la request HTTP de auto-vincular) corren en paralelo.
federatedMonitorLinkSchema.index(
  { localMonitorId: 1, federatedInstanceId: 1, remoteMonitorId: 1 },
  { unique: true },
);

export const FederatedMonitorLinkModel = model<FederatedMonitorLinkDoc>(
  "FederatedMonitorLink",
  federatedMonitorLinkSchema,
);
