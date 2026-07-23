// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface FederationIdentity {
  certPem: string;
  fingerprint: string;
}

/**
 * Puerto (interfaz) para obtener el certificado de identidad de federación propio de esta
 * instancia (autofirmado, generado una sola vez y reutilizado para todos los pares).
 */
export interface IFederationIdentityService {
  getOrCreateOwnCertificate(): Promise<FederationIdentity>;
}
