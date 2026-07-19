// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import { CreateBackupData, IBackupRepository } from "../../../../application/ports/repositories/backup-repository";
import { IBackup } from "../../../../domain/entities/backup";
import { BackupDoc, BackupModel } from "../schemas/backup.schema";
import { toDomainId } from "../to-domain-id";

export class MongooseBackupRepository implements IBackupRepository {
  async create(data: CreateBackupData): Promise<IBackup> {
    const doc = await BackupModel.create({
      userId: new Types.ObjectId(data.userId),
      strategy: data.strategy,
      payload: data.payload,
    });
    return this.toDomain(doc);
  }

  async findAll(): Promise<IBackup[]> {
    const docs = await BackupModel.find({}).sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<IBackup | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await BackupModel.findOne({ _id: id });
    return doc ? this.toDomain(doc) : null;
  }

  async deleteAll(): Promise<number> {
    const result = await BackupModel.deleteMany({});
    return result.deletedCount ?? 0;
  }

  private toDomain(doc: HydratedDocument<BackupDoc>): IBackup {
    return {
      id: toDomainId(doc._id),
      userId: String(doc.userId),
      strategy: doc.strategy,
      payload: doc.payload,
      createdAt: doc.createdAt,
    };
  }
}
