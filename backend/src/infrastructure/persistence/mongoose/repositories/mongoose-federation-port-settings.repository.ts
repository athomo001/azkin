// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import {
  IFederationPortSettingsRepository,
  UpsertFederationPortSettingsData,
} from "../../../../application/ports/repositories/federation-port-settings-repository";
import { IFederationPortSettings } from "../../../../domain/entities/federation-port-settings";
import {
  FEDERATION_PORT_SETTINGS_SINGLETON_ID,
  FederationPortSettingsDoc,
  FederationPortSettingsModel,
} from "../schemas/federation-port-settings.schema";
import { toDomainId } from "../to-domain-id";

export class MongooseFederationPortSettingsRepository implements IFederationPortSettingsRepository {
  async getActive(): Promise<IFederationPortSettings | null> {
    const doc = await FederationPortSettingsModel.findById(FEDERATION_PORT_SETTINGS_SINGLETON_ID);
    return doc ? this.toDomain(doc) : null;
  }

  async upsert(data: UpsertFederationPortSettingsData): Promise<IFederationPortSettings> {
    const doc = await FederationPortSettingsModel.findByIdAndUpdate(
      FEDERATION_PORT_SETTINGS_SINGLETON_ID,
      {
        port: data.port,
        updatedById: new Types.ObjectId(data.updatedById),
      },
      { new: true, upsert: true },
    );
    return this.toDomain(doc!);
  }

  private toDomain(doc: HydratedDocument<FederationPortSettingsDoc>): IFederationPortSettings {
    return {
      id: toDomainId(doc._id),
      port: doc.port,
      updatedAt: doc.updatedAt,
      updatedById: String(doc.updatedById),
    };
  }
}
