// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, Types, model } from "mongoose";

export interface AuditLogDoc {
  actorId: Types.ObjectId | null;
  action: string;
  targetType: string;
  targetIds: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<AuditLogDoc>(
  {
    // Opcional: un LOGIN_FAILED con un identificador que no existe no tiene usuario al cual referenciar.
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: false, default: null, index: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true },
    targetIds: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

export const AuditLogModel = model<AuditLogDoc>("AuditLog", auditLogSchema);
