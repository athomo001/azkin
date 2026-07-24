// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import {
  CreateFederatedMonitorLinkData,
  IFederatedMonitorLinkRepository,
} from "../../../../application/ports/repositories/federated-monitor-link-repository";
import { IFederatedMonitorLink } from "../../../../domain/entities/federated-monitor-link";
import { FederatedMonitorLinkDoc, FederatedMonitorLinkModel } from "../schemas/federated-monitor-link.schema";
import { toDomainId } from "../to-domain-id";

export class MongooseFederatedMonitorLinkRepository implements IFederatedMonitorLinkRepository {
  async create(data: CreateFederatedMonitorLinkData): Promise<IFederatedMonitorLink> {
    const doc = await FederatedMonitorLinkModel.create({
      localMonitorId: new Types.ObjectId(data.localMonitorId),
      federatedInstanceId: new Types.ObjectId(data.federatedInstanceId),
      remoteMonitorId: data.remoteMonitorId,
      remoteMonitorLabel: data.remoteMonitorLabel,
      createdById: new Types.ObjectId(data.createdById),
      lastSyncedAt: null,
    });
    return this.toDomain(doc);
  }

  async findAll(): Promise<IFederatedMonitorLink[]> {
    const docs = await FederatedMonitorLinkModel.find().sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByLocalMonitorId(localMonitorId: string): Promise<IFederatedMonitorLink[]> {
    if (!Types.ObjectId.isValid(localMonitorId)) return [];
    const docs = await FederatedMonitorLinkModel.find({ localMonitorId: new Types.ObjectId(localMonitorId) });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<IFederatedMonitorLink | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await FederatedMonitorLinkModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByFederatedInstanceId(federatedInstanceId: string): Promise<IFederatedMonitorLink[]> {
    if (!Types.ObjectId.isValid(federatedInstanceId)) return [];
    const docs = await FederatedMonitorLinkModel.find({ federatedInstanceId: new Types.ObjectId(federatedInstanceId) });
    return docs.map((doc) => this.toDomain(doc));
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await FederatedMonitorLinkModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async deleteByFederatedInstanceId(federatedInstanceId: string): Promise<number> {
    if (!Types.ObjectId.isValid(federatedInstanceId)) return 0;
    const result = await FederatedMonitorLinkModel.deleteMany({ federatedInstanceId: new Types.ObjectId(federatedInstanceId) });
    return result.deletedCount ?? 0;
  }

  async markSynced(id: string, at: Date): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await FederatedMonitorLinkModel.findByIdAndUpdate(id, { lastSyncedAt: at });
  }

  private toDomain(doc: HydratedDocument<FederatedMonitorLinkDoc>): IFederatedMonitorLink {
    return {
      id: toDomainId(doc._id),
      localMonitorId: String(doc.localMonitorId),
      federatedInstanceId: String(doc.federatedInstanceId),
      remoteMonitorId: doc.remoteMonitorId,
      remoteMonitorLabel: doc.remoteMonitorLabel,
      createdById: String(doc.createdById),
      createdAt: doc.createdAt,
      lastSyncedAt: doc.lastSyncedAt,
    };
  }
}
