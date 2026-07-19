// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";
import { ApiKeyScope } from "../../../../domain/entities/api-key";

export interface ApiKeyDoc {
  adminId: Types.ObjectId;
  name: string;
  keyHash: string;
  keyPrefix: string;
  scopes: ApiKeyScope[];
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

const apiKeySchema = new Schema<ApiKeyDoc>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    keyHash: { type: String, required: true, unique: true, index: true },
    keyPrefix: { type: String, required: true },
    scopes: { type: [String], default: ["read"] },
    lastUsedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

export const ApiKeyModel = model<ApiKeyDoc>("ApiKey", apiKeySchema);
