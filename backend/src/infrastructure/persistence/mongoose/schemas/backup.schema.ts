// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";
import { BackupStrategy, IBackupPayload } from "../../../../domain/entities/backup";

export interface BackupDoc {
  userId: Types.ObjectId;
  strategy: BackupStrategy;
  payload: IBackupPayload;
  createdAt: Date;
}

const backupSchema = new Schema<BackupDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    strategy: { type: String, enum: ["accumulate", "replace"], required: true },
    payload: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

export const BackupModel = model<BackupDoc>("Backup", backupSchema);
