// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Instancia Azkin independiente con la que esta instancia se federó (AZ-049, slice 1: enrollment).
 * La confianza es un secreto simétrico generado una vez durante el enrollment (protegido solo por
 * el token de un solo uso, igual nivel que el intercambio original de certificados) — cada lado
 * lo guarda cifrado en reposo y lo presenta en el header `X-Federation-Secret` en cada pedido al
 * otro (el sondeo es bidireccional). Corre sobre el mismo puerto que la API principal, con o sin
 * HTTPS nativo — no hay un puerto ni listener dedicado a federación.
 */
export type FederatedInstanceStatus = "enrolled" | "revoked";

export interface IFederatedInstance {
  id: string;
  label: string;
  remoteUrl: string;
  /** Secreto compartido cifrado en reposo (AES-256-GCM, ver tls-key-cipher.ts) — nunca se expone
   * en texto plano fuera del backend, ni siquiera al propio Admin tras el enrollment. */
  remoteSecretEncrypted: string;
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
