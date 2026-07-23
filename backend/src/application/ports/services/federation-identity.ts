// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface FederationIdentity {
  certPem: string;
  fingerprint: string;
}

/**
 * Puerto (interfaz) para obtener el certificado de identidad de federación propio de esta
 * instancia (autofirmado, generado una sola vez y reutilizado para todos los pares).
 */
export interface FederationServerCredentials {
  certPem: string;
  keyPem: string;
  fingerprint: string;
}

export interface IFederationIdentityService {
  getOrCreateOwnCertificate(): Promise<FederationIdentity>;
  /** Igual que `getOrCreateOwnCertificate`, pero además descifra y expone la llave privada — uso
   * exclusivo del wiring que levanta el listener mTLS (`FederationServerManager`), nunca de los
   * casos de uso de enrollment (esos solo necesitan el certificado público). */
  getOwnServerCredentials(): Promise<FederationServerCredentials>;
}
