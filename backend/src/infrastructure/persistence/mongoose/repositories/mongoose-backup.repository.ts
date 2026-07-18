// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import { CreateBackupData, IBackupRepository } from "../../../../application/ports/repositories/backup-repository";
import { IBackup } from "../../../../domain/entities/backup";
import { BackupDoc, BackupModel } from "../schemas/backup.schema";

export class MongooseBackupRepository implements IBackupRepository {
  async create(data: CreateBackupData): Promise<IBackup> {
    const doc = await BackupModel.create({
      userId: new Types.ObjectId(data.userId),
      strategy: data.strategy,
      payload: data.payload,
    });
    return this.toDomain(doc);
  }

  async findAllByUser(userId: string): Promise<IBackup[]> {
    const docs = await BackupModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(userId: string, id: string): Promise<IBackup | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await BackupModel.findOne({ _id: id, userId });
    return doc ? this.toDomain(doc) : null;
  }

  async deleteAllByUser(userId: string): Promise<number> {
    const result = await BackupModel.deleteMany({ userId });
    return result.deletedCount ?? 0;
  }

  private toDomain(doc: HydratedDocument<BackupDoc>): IBackup {
    return {
      id: String(doc._id),
      userId: String(doc.userId),
      strategy: doc.strategy,
      payload: doc.payload,
      createdAt: doc.createdAt,
    };
  }
}
