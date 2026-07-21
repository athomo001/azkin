// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface HeartbeatDoc {
  timestamp: Date;
  monitorId: Types.ObjectId;
  status: number;
  ping: number | null;
  msg: string | null;
  certExpiry?: number | null;
  domainExpiry?: number | null;
  isLocalNetworkDown?: boolean;
}

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

const heartbeatSchema = new Schema<HeartbeatDoc>(
  {
    timestamp: { type: Date, required: true },
    monitorId: { type: Schema.Types.ObjectId, ref: "Monitor", required: true },
    status: { type: Number, enum: [0, 1, 2, 3, 4], required: true },
    ping: { type: Number, default: null },
    msg: { type: String, default: null },
    certExpiry: { type: Number, default: null },
    domainExpiry: { type: Number, default: null },
    isLocalNetworkDown: { type: Boolean, default: false },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "monitorId",
      granularity: "minutes",
    },
    expireAfterSeconds: THIRTY_DAYS_IN_SECONDS, // MongoDB purga solo (sin DELETE en caliente)
    versionKey: false,
  },
);

// Acelera GET /monitor/:id/history y las agregaciones de resumen.
heartbeatSchema.index({ monitorId: 1, timestamp: -1 });

export const HeartbeatModel = model<HeartbeatDoc>("Heartbeat", heartbeatSchema);
