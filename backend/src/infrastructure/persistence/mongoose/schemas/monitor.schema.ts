// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
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
  pushToken?: string;
  keyword?: string;
  keywordMethod?: "presence" | "absence";
  dnsResolver?: string;
  dnsRecordType?: "A" | "AAAA" | "CNAME" | "MX" | "TXT";
  
  // SNMP Fields
  snmpVersion?: "v1" | "v2c" | "v3";
  snmpCommunity?: string;
  snmpPort?: number;
  snmpOid?: string;
  snmpV3Username?: string;
  snmpV3AuthProtocol?: "md5" | "sha";
  snmpV3AuthKey?: string;
  snmpV3PrivProtocol?: "des" | "aes";
  snmpV3PrivKey?: string;

  group: string | null;
  tags: string[];
  isActive: boolean;
  notificationIds: Types.ObjectId[];
  headers?: Map<string, string>;
  userAgent?: string;
  ignoreTls?: boolean;

  // Detección de Defacement (Integridad)
  integrityEnabled?: boolean;
  integrityProfile?: "static" | "dynamic";
  integrityIgnoredCssSelectors?: string[];
  integrityVisualMasks?: { x: number; y: number; width: number; height: number }[];
  integrityAllowedScripts?: string[];
  integrityThreshold?: number;
  createdAt: Date;
  updatedAt: Date;
}

const monitorSchema = new Schema<MonitorDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["http", "ping", "port", "dns", "push", "snmp"], required: true },
    target: {
      type: String,
      required: function (this: any): boolean {
        return this.type !== "push"; // target no es obligatorio para push (pasivo)
      },
      trim: true,
    },
    port: {
      type: Number,
      min: 1,
      max: 65535,
      required: function (this: any): boolean {
        return this.type === "port";
      },
    },
    interval: { type: Number, required: true, min: 20, default: 60 },
    retries: { type: Number, required: true, min: 0, default: 0 },
    retryInterval: { type: Number, required: true, min: 20, default: 60 },
    
    pushToken: { type: String, default: null, index: true },
    keyword: { type: String, default: null },
    keywordMethod: { type: String, enum: ["presence", "absence"], default: "presence" },
    dnsResolver: { type: String, default: null },
    dnsRecordType: { type: String, enum: ["A", "AAAA", "CNAME", "MX", "TXT"], default: "A" },
    
    // SNMP Schema Fields
    snmpVersion: { type: String, enum: ["v1", "v2c", "v3"], default: "v2c" },
    snmpCommunity: { type: String, default: "public" },
    snmpPort: { type: Number, default: 161 },
    snmpOid: { type: String, default: "1.3.6.1.2.1.1.5.0" },
    snmpV3Username: { type: String, default: "" },
    snmpV3AuthProtocol: { type: String, enum: ["md5", "sha"], default: "md5" },
    snmpV3AuthKey: { type: String, default: "" },
    snmpV3PrivProtocol: { type: String, enum: ["des", "aes"], default: "des" },
    snmpV3PrivKey: { type: String, default: "" },

    group: { type: String, default: null, trim: true, index: true },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    notificationIds: [{ type: Schema.Types.ObjectId, ref: "Notification", default: [] }],
    
    headers: { type: Map, of: String, default: {} },
    userAgent: { type: String, default: "" },
    ignoreTls: { type: Boolean, default: false },

    integrityEnabled: { type: Boolean, default: false },
    integrityProfile: { type: String, enum: ["static", "dynamic"], default: "static" },
    integrityIgnoredCssSelectors: { type: [String], default: [] },
    integrityVisualMasks: [
      {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
      },
    ],
    integrityAllowedScripts: { type: [String], default: [] },
    integrityThreshold: { type: Number, default: 0.10 },
  },
  { timestamps: true, versionKey: false },
);

monitorSchema.index({ userId: 1, group: 1 });

export const MonitorModel = model<MonitorDoc>("Monitor", monitorSchema);
