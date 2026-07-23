// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface FederatedHeartbeatDoc {
  timestamp: Date;
  federatedMonitorLinkId: Types.ObjectId;
  status: number;
  ping: number | null;
}

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

// Mismo patrón de colección Time-Series que backend/.../schemas/heartbeat.schema.ts (mismo TTL de
// 30 días), pero con `federatedMonitorLinkId` como metaField en vez de `monitorId` — la entidad
// que se sigue acá es el vínculo con el par, no un monitor local.
const federatedHeartbeatSchema = new Schema<FederatedHeartbeatDoc>(
  {
    timestamp: { type: Date, required: true },
    federatedMonitorLinkId: { type: Schema.Types.ObjectId, ref: "FederatedMonitorLink", required: true },
    status: { type: Number, enum: [0, 1, 2, 3, 4], required: true },
    ping: { type: Number, default: null },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "federatedMonitorLinkId",
      granularity: "minutes",
    },
    expireAfterSeconds: THIRTY_DAYS_IN_SECONDS,
    versionKey: false,
  },
);

federatedHeartbeatSchema.index({ federatedMonitorLinkId: 1, timestamp: -1 });

export const FederatedHeartbeatModel = model<FederatedHeartbeatDoc>("FederatedHeartbeat", federatedHeartbeatSchema);
