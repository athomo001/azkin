// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface FederatedInstanceDoc {
  label: string;
  remoteUrl: string;
  peerCertFingerprint: string;
  status: "enrolled" | "revoked";
  createdById: Types.ObjectId;
  createdAt: Date;
  revokedAt: Date | null;
}

const federatedInstanceSchema = new Schema<FederatedInstanceDoc>(
  {
    label: { type: String, required: true },
    remoteUrl: { type: String, required: true },
    peerCertFingerprint: { type: String, required: true },
    status: { type: String, enum: ["enrolled", "revoked"], default: "enrolled" },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

export const FederatedInstanceModel = model<FederatedInstanceDoc>("FederatedInstance", federatedInstanceSchema);
