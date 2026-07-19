// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import { IAuditLogRepository, RecordAuditLogData } from "../../../../application/ports/repositories/audit-log-repository";
import { IAuditLog } from "../../../../domain/entities/audit-log";
import { AuditLogDoc, AuditLogModel } from "../schemas/audit-log.schema";
import { toDomainId } from "../to-domain-id";

export class MongooseAuditLogRepository implements IAuditLogRepository {
  async record(data: RecordAuditLogData): Promise<IAuditLog> {
    const doc = await AuditLogModel.create({
      actorId: new Types.ObjectId(data.actorId),
      action: data.action,
      targetType: data.targetType,
      targetIds: data.targetIds ?? [],
      metadata: data.metadata ?? {},
    });
    return this.toDomain(doc);
  }

  async listRecent(actorId: string, limit = 50): Promise<IAuditLog[]> {
    const docs = await AuditLogModel.find({ actorId }).sort({ createdAt: -1 }).limit(limit);
    return docs.map((doc) => this.toDomain(doc));
  }

  async listAll(limit = 50): Promise<IAuditLog[]> {
    const docs = await AuditLogModel.find({}).sort({ createdAt: -1 }).limit(limit);
    return docs.map((doc) => this.toDomain(doc));
  }

  private toDomain(doc: HydratedDocument<AuditLogDoc>): IAuditLog {
    return {
      id: toDomainId(doc._id),
      actorId: String(doc.actorId),
      action: doc.action,
      targetType: doc.targetType,
      targetIds: doc.targetIds,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
    };
  }
}
