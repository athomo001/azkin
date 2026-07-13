import { Schema, Types, model } from "mongoose";
import { MonitorType } from "../../../../domain/value-objects/monitor-type";

export interface MonitorDoc {
  userId: Types.ObjectId;
  name: string;
  type: MonitorType;
  target: string;
  port?: number;
  interval: number;
  retries: number;
  retryInterval: number;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const monitorSchema = new Schema<MonitorDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["http", "ping", "port"], required: true },
    target: { type: String, required: true, trim: true },
    port: {
      type: Number,
      min: 1,
      max: 65535,
      required: function (this: MonitorDoc): boolean {
        return this.type === "port";
      },
    },
    interval: { type: Number, required: true, min: 20, default: 60 },
    retries: { type: Number, required: true, min: 0, default: 0 },
    retryInterval: { type: Number, required: true, min: 20, default: 60 },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

// Índice multikey para GET /tags/:tagName/overview y listados por usuario.
monitorSchema.index({ userId: 1, tags: 1 });

export const MonitorModel = model<MonitorDoc>("Monitor", monitorSchema);
