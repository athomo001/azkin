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
    // $set explícito y parcial: un objeto plano sin operadores reemplazaría el documento entero
    // (borrando, ej., un `port` ya guardado al solo actualizar `ownUrl`), ver nota en el puerto.
    const set: Partial<FederationPortSettingsDoc> = { updatedById: new Types.ObjectId(data.updatedById) };
    if (data.port !== undefined) set.port = data.port;
    if (data.ownUrl !== undefined) set.ownUrl = data.ownUrl;

    const doc = await FederationPortSettingsModel.findByIdAndUpdate(
      FEDERATION_PORT_SETTINGS_SINGLETON_ID,
      { $set: set },
      { new: true, upsert: true },
    );
    return this.toDomain(doc!);
  }

  private toDomain(doc: HydratedDocument<FederationPortSettingsDoc>): IFederationPortSettings {
    return {
      id: toDomainId(doc._id),
      port: doc.port,
      ownUrl: doc.ownUrl,
      updatedAt: doc.updatedAt,
      updatedById: String(doc.updatedById),
    };
  }
}
