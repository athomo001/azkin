// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  FederationIdentityData,
  IFederationIdentityRepository,
} from "../../../../application/ports/repositories/federation-identity-repository";
import { FEDERATION_IDENTITY_SINGLETON_ID, FederationIdentityModel } from "../schemas/federation-identity.schema";

export class MongooseFederationIdentityRepository implements IFederationIdentityRepository {
  async get(): Promise<FederationIdentityData | null> {
    const doc = await FederationIdentityModel.findById(FEDERATION_IDENTITY_SINGLETON_ID);
    return doc
      ? { certPem: doc.certPem, keyPemEncrypted: doc.keyPemEncrypted, fingerprint: doc.fingerprint }
      : null;
  }

  async create(data: FederationIdentityData): Promise<FederationIdentityData> {
    const doc = await FederationIdentityModel.findByIdAndUpdate(
      FEDERATION_IDENTITY_SINGLETON_ID,
      { certPem: data.certPem, keyPemEncrypted: data.keyPemEncrypted, fingerprint: data.fingerprint },
      { new: true, upsert: true },
    );
    return { certPem: doc!.certPem, keyPemEncrypted: doc!.keyPemEncrypted, fingerprint: doc!.fingerprint };
  }
}
