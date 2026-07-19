// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import {
  CreateNotificationData,
  INotificationRepository,
  UpdateNotificationData,
} from "../../../../application/ports/repositories/notification-repository";
import { INotification } from "../../../../domain/entities/notification";
import { NotificationDoc, NotificationModel } from "../schemas/notification.schema";
import { toDomainId } from "../to-domain-id";

/**
 * Implementación Mongoose del repositorio de notificaciones.
 * Conecta los puertos de la capa de aplicación con el modelo de datos de MongoDB.
 */
export class MongooseNotificationRepository implements INotificationRepository {
  async create(data: CreateNotificationData): Promise<INotification> {
    const doc = await NotificationModel.create({
      userId: new Types.ObjectId(data.userId),
      name: data.name,
      type: data.type,
      config: data.config,
      isActive: data.isActive ?? true,
      events: data.events ?? "all",
      templates: data.templates ?? {},
    });
    return this.toDomain(doc);
  }

  async findAll(): Promise<INotification[]> {
    const docs = await NotificationModel.find({});
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<INotification | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await NotificationModel.findOne({ _id: id });
    return doc ? this.toDomain(doc) : null;
  }

  async update(id: string, data: UpdateNotificationData): Promise<INotification | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await NotificationModel.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await NotificationModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  private toDomain(doc: HydratedDocument<NotificationDoc>): INotification {
    return {
      id: toDomainId(doc._id),
      userId: String(doc.userId),
      name: doc.name,
      type: doc.type,
      config: doc.config as Record<string, unknown>,
      isActive: doc.isActive,
      events: doc.events ?? "all",
      templates: doc.templates ?? {},
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
