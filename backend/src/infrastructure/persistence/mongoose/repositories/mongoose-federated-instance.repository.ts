// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import {
  CreateFederatedInstanceData,
  IFederatedInstanceRepository,
} from "../../../../application/ports/repositories/federated-instance-repository";
import { IFederatedInstance, FederatedInstanceStatus } from "../../../../domain/entities/federated-instance";
import { FederatedInstanceDoc, FederatedInstanceModel } from "../schemas/federated-instance.schema";
import { toDomainId } from "../to-domain-id";

export class MongooseFederatedInstanceRepository implements IFederatedInstanceRepository {
  async create(data: CreateFederatedInstanceData): Promise<IFederatedInstance> {
    const doc = await FederatedInstanceModel.create({
      label: data.label,
      remoteUrl: data.remoteUrl,
      remoteSecretEncrypted: data.remoteSecretEncrypted,
      status: data.status ?? "enrolled",
      createdById: new Types.ObjectId(data.createdById),
      revokedAt: null,
      lastSuccessfulSyncAt: null,
      notifiedDown: false,
    });
    return this.toDomain(doc);
  }

  async findAll(): Promise<IFederatedInstance[]> {
    const docs = await FederatedInstanceModel.find().sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<IFederatedInstance | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await FederatedInstanceModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async countActive(): Promise<number> {
    return FederatedInstanceModel.countDocuments({ status: "enrolled" });
  }

  async revoke(id: string): Promise<IFederatedInstance | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await FederatedInstanceModel.findByIdAndUpdate(
      id,
      { status: "revoked", revokedAt: new Date() },
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }

  async reactivate(id: string): Promise<IFederatedInstance | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await FederatedInstanceModel.findByIdAndUpdate(
      id,
      { status: "enrolled", revokedAt: null },
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await FederatedInstanceModel.deleteOne({ _id: id });
    return (res.deletedCount ?? 0) > 0;
  }

  async findAllActive(): Promise<IFederatedInstance[]> {
    const docs = await FederatedInstanceModel.find({ status: "enrolled" });
    return docs.map((doc) => this.toDomain(doc));
  }

  async markSyncSuccess(id: string, at: Date): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await FederatedInstanceModel.findByIdAndUpdate(id, { lastSuccessfulSyncAt: at });
  }

  async setNotifiedDown(id: string, notifiedDown: boolean): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await FederatedInstanceModel.findByIdAndUpdate(id, { notifiedDown });
  }

  private toDomain(doc: HydratedDocument<FederatedInstanceDoc>): IFederatedInstance {
    return {
      id: toDomainId(doc._id),
      label: doc.label,
      remoteUrl: doc.remoteUrl,
      remoteSecretEncrypted: doc.remoteSecretEncrypted,
      status: doc.status as FederatedInstanceStatus,
      createdById: String(doc.createdById),
      createdAt: doc.createdAt,
      revokedAt: doc.revokedAt,
      lastSuccessfulSyncAt: doc.lastSuccessfulSyncAt,
      notifiedDown: doc.notifiedDown,
    };
  }
}
