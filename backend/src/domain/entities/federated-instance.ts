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
  /** Puerto del listener mTLS dedicado del par (AZ-049, slice 2) — distinto del puerto de la API
   * principal usada solo para el bootstrap de enrollment. */
  remoteFederationPort: number;
  peerCertFingerprint: string;
  status: FederatedInstanceStatus;
  createdById: string;
  createdAt: Date;
  revokedAt: Date | null;
  /** Último sondeo exitoso a este par (cualquiera de sus monitores vinculados). Null si nunca. */
  lastSuccessfulSyncAt: Date | null;
  /** Evita reenviar la notificación de "federación sin reportar" en cada tick del cron —
   * solo se envía en la transición hacia el estado "sin reportar". */
  notifiedDown: boolean;
}
