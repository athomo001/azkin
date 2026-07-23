// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import {
  IFederationSettingsRepository,
  UpsertFederationSettingsData,
} from "../../../../application/ports/repositories/federation-settings-repository";
import { IFederationSettings } from "../../../../domain/entities/federation-settings";
import {
  FEDERATION_SETTINGS_SINGLETON_ID,
  FederationSettingsDoc,
  FederationSettingsModel,
} from "../schemas/federation-settings.schema";
import { toDomainId } from "../to-domain-id";

export class MongooseFederationSettingsRepository implements IFederationSettingsRepository {
  async getActive(): Promise<IFederationSettings | null> {
    const doc = await FederationSettingsModel.findById(FEDERATION_SETTINGS_SINGLETON_ID);
    return doc ? this.toDomain(doc) : null;
  }

  async upsert(data: UpsertFederationSettingsData): Promise<IFederationSettings> {
    const doc = await FederationSettingsModel.findByIdAndUpdate(
      FEDERATION_SETTINGS_SINGLETON_ID,
      { $set: { ownUrl: data.ownUrl, updatedById: new Types.ObjectId(data.updatedById) } },
      { new: true, upsert: true },
    );
    return this.toDomain(doc!);
  }

  private toDomain(doc: HydratedDocument<FederationSettingsDoc>): IFederationSettings {
    return {
      id: toDomainId(doc._id),
      ownUrl: doc.ownUrl,
      updatedAt: doc.updatedAt,
      updatedById: String(doc.updatedById),
    };
  }
}
