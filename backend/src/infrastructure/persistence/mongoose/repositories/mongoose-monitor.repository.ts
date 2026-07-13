import { HydratedDocument, Types } from "mongoose";
import {
  CreateMonitorData,
  IMonitorRepository,
  UpdateMonitorData,
} from "../../../../application/ports/repositories/monitor-repository";
import { IMonitor } from "../../../../domain/entities/monitor";
import { MonitorDoc, MonitorModel } from "../schemas/monitor.schema";

export class MongooseMonitorRepository implements IMonitorRepository {
  async create(data: CreateMonitorData): Promise<IMonitor> {
    const doc = await MonitorModel.create({
      userId: new Types.ObjectId(data.userId),
      name: data.name,
      type: data.type,
      target: data.target,
      port: data.port,
      interval: data.interval,
      retries: data.retries,
      retryInterval: data.retryInterval,
      tags: data.tags,
    });
    return this.toDomain(doc);
  }

  async findAllByUser(userId: string): Promise<IMonitor[]> {
    const docs = await MonitorModel.find({ userId }).sort({ createdAt: 1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(userId: string, id: string): Promise<IMonitor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await MonitorModel.findOne({ _id: id, userId });
    return doc ? this.toDomain(doc) : null;
  }

  async update(userId: string, id: string, data: UpdateMonitorData): Promise<IMonitor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await MonitorModel.findOneAndUpdate({ _id: id, userId }, data, { new: true });
    return doc ? this.toDomain(doc) : null;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await MonitorModel.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  async findAllActive(): Promise<IMonitor[]> {
    const docs = await MonitorModel.find({ isActive: true });
    return docs.map((doc) => this.toDomain(doc));
  }

  async distinctTags(userId: string): Promise<string[]> {
    const tags = await MonitorModel.distinct("tags", { userId });
    return tags as string[];
  }

  private toDomain(doc: HydratedDocument<MonitorDoc>): IMonitor {
    return {
      id: String(doc._id),
      userId: String(doc.userId),
      name: doc.name,
      type: doc.type,
      target: doc.target,
      port: doc.port,
      interval: doc.interval,
      retries: doc.retries,
      retryInterval: doc.retryInterval,
      tags: doc.tags,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
