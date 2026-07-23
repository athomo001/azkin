// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Instancia Azkin independiente con la que esta instancia se federó (AZ-049, slice 1: enrollment).
 * La confianza no es una cadena de CA: es pinning por huella (fingerprint) del certificado de
 * identidad autofirmado que el par presentó durante el enrollment.
 */
export type FederatedInstanceStatus = "enrolled" | "revoked";

export interface IFederatedInstance {
  id: string;
  label: string;
  remoteUrl: string;
  peerCertFingerprint: string;
  status: FederatedInstanceStatus;
  createdById: string;
  createdAt: Date;
  revokedAt: Date | null;
}
