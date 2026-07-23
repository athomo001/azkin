// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Schema, model } from "mongoose";

export interface FederationIdentityDoc {
  certPem: string;
  keyPemEncrypted: string;
  fingerprint: string;
}

// Documento único (singleton) identificado por un _id fijo conocido — distinto del de
// TlsConfig (...0001) para no chocar en la misma colección de _ids reservados.
export const FEDERATION_IDENTITY_SINGLETON_ID = "000000000000000000000002";

const federationIdentitySchema = new Schema<FederationIdentityDoc>(
  {
    certPem: { type: String, required: true },
    keyPemEncrypted: { type: String, required: true },
    fingerprint: { type: String, required: true },
  },
  { versionKey: false },
);

export const FederationIdentityModel = model<FederationIdentityDoc>("FederationIdentity", federationIdentitySchema);
