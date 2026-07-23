// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface FederatedInstanceDoc {
  label: string;
  remoteUrl: string;
  remoteFederationPort: number;
  peerCertFingerprint: string;
  status: "enrolled" | "revoked";
  createdById: Types.ObjectId;
  createdAt: Date;
  revokedAt: Date | null;
  lastSuccessfulSyncAt: Date | null;
  notifiedDown: boolean;
}

const federatedInstanceSchema = new Schema<FederatedInstanceDoc>(
  {
    label: { type: String, required: true },
    remoteUrl: { type: String, required: true },
    remoteFederationPort: { type: Number, required: true },
    peerCertFingerprint: { type: String, required: true },
    status: { type: String, enum: ["enrolled", "revoked"], default: "enrolled" },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    revokedAt: { type: Date, default: null },
    lastSuccessfulSyncAt: { type: Date, default: null },
    notifiedDown: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

// Busqueda por huella en cada request entrante al listener mTLS (verify-peer-certificate.ts).
federatedInstanceSchema.index({ peerCertFingerprint: 1 });

export const FederatedInstanceModel = model<FederatedInstanceDoc>("FederatedInstance", federatedInstanceSchema);
