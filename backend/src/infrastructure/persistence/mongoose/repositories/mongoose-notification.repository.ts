import { HydratedDocument, Types } from "mongoose";
import {
  CreateNotificationData,
  INotificationRepository,
  UpdateNotificationData,
} from "../../../../application/ports/repositories/notification-repository";
import { INotification } from "../../../../domain/entities/notification";
import { NotificationDoc, NotificationModel } from "../schemas/notification.schema";

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
    });
    return this.toDomain(doc);
  }

  async findAllByUser(userId: string): Promise<INotification[]> {
    const docs = await NotificationModel.find({ userId });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(userId: string, id: string): Promise<INotification | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await NotificationModel.findOne({ _id: id, userId });
    return doc ? this.toDomain(doc) : null;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateNotificationData,
  ): Promise<INotification | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await NotificationModel.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  private toDomain(doc: HydratedDocument<NotificationDoc>): INotification {
    return {
      id: String(doc._id),
      userId: String(doc.userId),
      name: doc.name,
      type: doc.type,
      config: doc.config as Record<string, unknown>,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
