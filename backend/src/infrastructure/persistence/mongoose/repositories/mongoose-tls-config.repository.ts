// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import { ITlsConfigRepository, UpsertTlsConfigData } from "../../../../application/ports/repositories/tls-config-repository";
import { ITlsConfig } from "../../../../domain/entities/tls-config";
import { TLS_CONFIG_SINGLETON_ID, TlsConfigDoc, TlsConfigModel } from "../schemas/tls-config.schema";
import { toDomainId } from "../to-domain-id";

export class MongooseTlsConfigRepository implements ITlsConfigRepository {
  async getActive(): Promise<ITlsConfig | null> {
    const doc = await TlsConfigModel.findById(TLS_CONFIG_SINGLETON_ID);
    return doc ? this.toDomain(doc) : null;
  }

  async upsert(data: UpsertTlsConfigData): Promise<ITlsConfig> {
    const doc = await TlsConfigModel.findByIdAndUpdate(
      TLS_CONFIG_SINGLETON_ID,
      {
        certPem: data.certPem,
        keyPemEncrypted: data.keyPemEncrypted,
        chainPem: data.chainPem,
        port: data.port,
        httpRedirect: data.httpRedirect,
        updatedById: new Types.ObjectId(data.updatedById),
      },
      { new: true, upsert: true },
    );
    return this.toDomain(doc!);
  }

  async deleteActive(): Promise<boolean> {
    const result = await TlsConfigModel.deleteOne({ _id: TLS_CONFIG_SINGLETON_ID });
    return result.deletedCount > 0;
  }

  private toDomain(doc: HydratedDocument<TlsConfigDoc>): ITlsConfig {
    return {
      id: toDomainId(doc._id),
      certPem: doc.certPem,
      keyPemEncrypted: doc.keyPemEncrypted,
      chainPem: doc.chainPem ?? undefined,
      port: doc.port,
      httpRedirect: doc.httpRedirect,
      updatedAt: doc.updatedAt,
      updatedById: String(doc.updatedById),
    };
  }
}
