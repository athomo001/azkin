// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface FederationEnrollmentTokenDoc {
  tokenHash: string;
  createdById: Types.ObjectId;
  expiresAt: Date;
}

const federationEnrollmentTokenSchema = new Schema<FederationEnrollmentTokenDoc>(
  {
    tokenHash: { type: String, required: true, unique: true },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false },
);

// TTL: Mongo purga el documento pasado expiresAt (limpieza en segundo plano, no instantánea —
// `consumeValid` igual filtra `expiresAt > now` en la query para la validez real).
federationEnrollmentTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const FederationEnrollmentTokenModel = model<FederationEnrollmentTokenDoc>(
  "FederationEnrollmentToken",
  federationEnrollmentTokenSchema,
);
