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
      peerCertFingerprint: data.peerCertFingerprint,
      status: "enrolled",
      createdById: new Types.ObjectId(data.createdById),
      revokedAt: null,
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

  private toDomain(doc: HydratedDocument<FederatedInstanceDoc>): IFederatedInstance {
    return {
      id: toDomainId(doc._id),
      label: doc.label,
      remoteUrl: doc.remoteUrl,
      peerCertFingerprint: doc.peerCertFingerprint,
      status: doc.status as FederatedInstanceStatus,
      createdById: String(doc.createdById),
      createdAt: doc.createdAt,
      revokedAt: doc.revokedAt,
    };
  }
}
