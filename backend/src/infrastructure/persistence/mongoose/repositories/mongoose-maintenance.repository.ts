// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import {
  CreateMaintenanceWindowData,
  IMaintenanceRepository,
  UpdateMaintenanceWindowData,
} from "../../../../application/ports/repositories/maintenance-repository";
import { IMaintenanceWindow } from "../../../../domain/entities/maintenance-window";
import { MaintenanceWindowDoc, MaintenanceWindowModel } from "../schemas/maintenance-window.schema";
import { toDomainId } from "../to-domain-id";

/**
 * Implementación Mongoose del repositorio de ventanas de mantenimiento.
 */
export class MongooseMaintenanceRepository implements IMaintenanceRepository {
  async create(data: CreateMaintenanceWindowData): Promise<IMaintenanceWindow> {
    const doc = await MaintenanceWindowModel.create({
      createdBy: new Types.ObjectId(data.createdBy),
      name: data.name,
      description: data.description,
      scope: data.scope,
      mode: data.mode,
      startAt: data.startAt ?? null,
      endAt: data.endAt ?? null,
      closedAt: null,
    });
    return this.toDomain(doc);
  }

  async findAll(): Promise<IMaintenanceWindow[]> {
    const docs = await MaintenanceWindowModel.find({}).sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findActive(): Promise<IMaintenanceWindow[]> {
    const now = new Date();
    const docs = await MaintenanceWindowModel.find({
      closedAt: null,
      $or: [
        { mode: "immediate" },
        { mode: "scheduled", startAt: { $lte: now }, endAt: { $gte: now } },
      ],
    });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<IMaintenanceWindow | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await MaintenanceWindowModel.findOne({ _id: id });
    return doc ? this.toDomain(doc) : null;
  }

  async update(id: string, data: UpdateMaintenanceWindowData): Promise<IMaintenanceWindow | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await MaintenanceWindowModel.findOneAndUpdate({ _id: id }, { $set: data }, { new: true });
    return doc ? this.toDomain(doc) : null;
  }

  async close(id: string): Promise<IMaintenanceWindow | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await MaintenanceWindowModel.findOneAndUpdate(
      { _id: id },
      { $set: { closedAt: new Date() } },
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await MaintenanceWindowModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  private toDomain(doc: HydratedDocument<MaintenanceWindowDoc>): IMaintenanceWindow {
    return {
      id: toDomainId(doc._id),
      createdBy: String(doc.createdBy),
      name: doc.name,
      description: doc.description,
      scope: doc.scope,
      mode: doc.mode,
      startAt: doc.startAt,
      endAt: doc.endAt,
      closedAt: doc.closedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
