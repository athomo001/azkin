// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";
import { IMaintenanceScope, MaintenanceMode } from "../../../../domain/entities/maintenance-window";

export interface MaintenanceWindowDoc {
  createdBy: Types.ObjectId;
  name: string;
  description?: string;
  scope: IMaintenanceScope[];
  mode: MaintenanceMode;
  startAt: Date | null;
  endAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceScopeSchema = new Schema<IMaintenanceScope>(
  {
    type: { type: String, enum: ["all", "group", "monitor"], required: true },
    value: { type: String },
  },
  { _id: false },
);

const maintenanceWindowSchema = new Schema<MaintenanceWindowDoc>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    scope: { type: [maintenanceScopeSchema], required: true, default: [] },
    mode: { type: String, enum: ["immediate", "scheduled"], required: true },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    closedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, versionKey: false },
);

// Acelera `findActive()`: filtra por closedAt (siempre) y por mode/startAt/endAt (ventanas programadas).
maintenanceWindowSchema.index({ closedAt: 1, mode: 1, startAt: 1, endAt: 1 });

export const MaintenanceWindowModel = model<MaintenanceWindowDoc>("MaintenanceWindow", maintenanceWindowSchema);
