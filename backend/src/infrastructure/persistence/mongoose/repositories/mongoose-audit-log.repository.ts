// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import { IAuditLogRepository, IIncidentAlertLookup, RecordAuditLogData } from "../../../../application/ports/repositories/audit-log-repository";
import { IAuditLog } from "../../../../domain/entities/audit-log";
import { AlertEventType } from "../../../../domain/value-objects/alert-event-type";
import { AuditLogDoc, AuditLogModel } from "../schemas/audit-log.schema";
import { toDomainId } from "../to-domain-id";

export class MongooseAuditLogRepository implements IAuditLogRepository, IIncidentAlertLookup {
  async record(data: RecordAuditLogData): Promise<IAuditLog> {
    const doc = await AuditLogModel.create({
      actorId: data.actorId ? new Types.ObjectId(data.actorId) : null,
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

  async findLastIncidentAlert(monitorId: string, notificationId: string): Promise<AlertEventType | null> {
    const doc = await AuditLogModel.findOne({
      targetType: "notification",
      targetIds: notificationId,
      "metadata.monitorId": monitorId,
      "metadata.alertEvent": { $in: ["DOWN", "DEGRADED", "RECOVERED"] },
    }).sort({ createdAt: -1 });
    return (doc?.metadata?.alertEvent as AlertEventType | undefined) ?? null;
  }

  async deleteAll(): Promise<number> {
    const result = await AuditLogModel.deleteMany({});
    return result.deletedCount ?? 0;
  }

  private toDomain(doc: HydratedDocument<AuditLogDoc>): IAuditLog {
    return {
      id: toDomainId(doc._id),
      actorId: doc.actorId ? String(doc.actorId) : null,
      action: doc.action,
      targetType: doc.targetType,
      targetIds: doc.targetIds,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
    };
  }
}
