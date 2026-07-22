// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import {
  CreateReportDefinitionData,
  IReportDefinitionRepository,
  UpdateReportDefinitionData,
} from "../../../../application/ports/repositories/report-definition-repository";
import { IReportDefinition } from "../../../../domain/entities/report-definition";
import { ReportDefinitionDoc, ReportDefinitionModel } from "../schemas/report-definition.schema";
import { toDomainId } from "../to-domain-id";

/**
 * Implementación Mongoose del repositorio de definiciones de informes (AZ-045).
 */
export class MongooseReportDefinitionRepository implements IReportDefinitionRepository {
  async create(data: CreateReportDefinitionData): Promise<IReportDefinition> {
    const doc = await ReportDefinitionModel.create({
      createdBy: new Types.ObjectId(data.createdBy),
      name: data.name,
      enabled: data.enabled,
      frequency: data.frequency,
      scope: data.scope,
      hour: data.hour,
      dayOfWeek: data.dayOfWeek,
      recipientMode: data.recipientMode,
      recipientEmails: data.recipientEmails,
      lastSentAt: null,
    });
    return this.toDomain(doc);
  }

  async findAll(): Promise<IReportDefinition[]> {
    const docs = await ReportDefinitionModel.find({}).sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findEnabled(): Promise<IReportDefinition[]> {
    const docs = await ReportDefinitionModel.find({ enabled: true });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<IReportDefinition | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await ReportDefinitionModel.findOne({ _id: id });
    return doc ? this.toDomain(doc) : null;
  }

  async update(id: string, data: UpdateReportDefinitionData): Promise<IReportDefinition | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await ReportDefinitionModel.findOneAndUpdate({ _id: id }, { $set: data }, { new: true });
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await ReportDefinitionModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async markSent(id: string, sentAt: Date): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await ReportDefinitionModel.updateOne({ _id: id }, { $set: { lastSentAt: sentAt } });
  }

  private toDomain(doc: HydratedDocument<ReportDefinitionDoc>): IReportDefinition {
    return {
      id: toDomainId(doc._id),
      createdBy: String(doc.createdBy),
      name: doc.name,
      enabled: doc.enabled,
      frequency: doc.frequency,
      scope: doc.scope,
      hour: doc.hour,
      dayOfWeek: doc.dayOfWeek,
      recipientMode: doc.recipientMode,
      recipientEmails: doc.recipientEmails,
      lastSentAt: doc.lastSentAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
