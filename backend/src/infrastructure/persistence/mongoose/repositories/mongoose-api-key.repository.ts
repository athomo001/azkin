// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import { IApiKeyRepository, CreateApiKeyData } from "../../../../application/ports/repositories/api-key-repository";
import { IApiKey } from "../../../../domain/entities/api-key";
import { ApiKeyDoc, ApiKeyModel } from "../schemas/api-key.schema";
import { toDomainId } from "../to-domain-id";

export class MongooseApiKeyRepository implements IApiKeyRepository {
  async create(data: CreateApiKeyData): Promise<IApiKey> {
    const doc = await ApiKeyModel.create({
      adminId: new Types.ObjectId(data.adminId),
      name: data.name,
      keyHash: data.keyHash,
      keyPrefix: data.keyPrefix,
      scopes: data.scopes,
      lastUsedAt: null,
      revokedAt: null,
    });
    return this.toDomain(doc);
  }

  async findByHash(keyHash: string): Promise<IApiKey | null> {
    const doc = await ApiKeyModel.findOne({ keyHash, revokedAt: null });
    return doc ? this.toDomain(doc) : null;
  }

  async findAllByAdmin(adminId: string): Promise<IApiKey[]> {
    if (!Types.ObjectId.isValid(adminId)) return [];
    const docs = await ApiKeyModel.find({ adminId }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async revoke(adminId: string, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await ApiKeyModel.updateOne(
      { _id: id, adminId, revokedAt: null },
      { revokedAt: new Date() },
    );
    return result.modifiedCount > 0;
  }

  async delete(adminId: string, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await ApiKeyModel.deleteOne({ _id: id, adminId });
    return result.deletedCount > 0;
  }

  async touchLastUsed(id: string): Promise<void> {
    await ApiKeyModel.updateOne({ _id: id }, { lastUsedAt: new Date() });
  }

  private toDomain(doc: HydratedDocument<ApiKeyDoc>): IApiKey {
    return {
      id: toDomainId(doc._id),
      adminId: String(doc.adminId),
      name: doc.name,
      keyHash: doc.keyHash,
      keyPrefix: doc.keyPrefix,
      scopes: doc.scopes,
      lastUsedAt: doc.lastUsedAt,
      createdAt: doc.createdAt,
      revokedAt: doc.revokedAt,
    };
  }
}
