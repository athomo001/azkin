// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface FederationIdentityData {
  certPem: string;
  keyPemEncrypted: string;
  fingerprint: string;
}

/**
 * Puerto (interfaz) para la persistencia del certificado de identidad de federación propio de
 * esta instancia (documento único/singleton, mismo patrón que `ITlsConfigRepository`).
 */
export interface IFederationIdentityRepository {
  get(): Promise<FederationIdentityData | null>;
  create(data: FederationIdentityData): Promise<FederationIdentityData>;
}
