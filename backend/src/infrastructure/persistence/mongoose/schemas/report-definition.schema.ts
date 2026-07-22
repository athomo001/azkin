// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";
import {
  IReportScope,
  ReportFrequency,
  ReportRecipientMode,
} from "../../../../domain/entities/report-definition";

export interface ReportDefinitionDoc {
  createdBy: Types.ObjectId;
  name: string;
  enabled: boolean;
  frequency: ReportFrequency;
  scope: IReportScope[];
  hour: number;
  dayOfWeek?: number;
  recipientMode: ReportRecipientMode;
  recipientEmails: string[];
  lastSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const reportScopeSchema = new Schema<IReportScope>(
  {
    type: { type: String, enum: ["all", "group", "monitor"], required: true },
    value: { type: String },
  },
  { _id: false },
);

const reportDefinitionSchema = new Schema<ReportDefinitionDoc>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    enabled: { type: Boolean, required: true, default: true },
    frequency: { type: String, enum: ["daily", "weekly"], required: true },
    scope: { type: [reportScopeSchema], required: true, default: [] },
    hour: { type: Number, required: true, min: 0, max: 23 },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    recipientMode: { type: String, enum: ["default_alert_email", "custom_list"], required: true },
    recipientEmails: { type: [String], required: true, default: [] },
    lastSentAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

// Acelera `findEnabled()` y el filtro por hora/día que hace el tick del cron.
reportDefinitionSchema.index({ enabled: 1, frequency: 1 });

export const ReportDefinitionModel = model<ReportDefinitionDoc>("ReportDefinition", reportDefinitionSchema);
