// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface RequestEnrollmentInput {
  remoteUrl: string;
  token: string;
  callerLabel: string;
  callerUrl: string;
  /** Secreto compartido que esta instancia genera durante el enrollment (AZ-049) — protegido solo
   * por el token de un solo uso. A partir de ahí, ambos lados lo presentan en el header
   * `X-Federation-Secret` para autenticarse mutuamente (ver verify-peer-secret.ts). */
  callerSecret: string;
}

/** Datos mínimos para alcanzar a un par ya enrolado — corre sobre el mismo puerto que su API
 * principal (con o sin HTTPS nativo), no un puerto dedicado. */
export interface RemotePeerAddress {
  remoteUrl: string;
  /** Secreto compartido ya descifrado (ver tls-key-cipher.ts) — nunca guardarlo así, solo pasarlo
   * en memoria justo antes de la llamada saliente. */
  secret: string;
}

export interface RemoteMonitorSummary {
  id: string;
  name: string;
  type: string;
  target: string;
  /** Requerido para recrear localmente un monitor tipo "port" (TCP) — no es sensible (a
   * diferencia de credenciales SNMP o secretos de notificación), así que sí viaja en el catálogo. */
  port?: number | null;
  lastStatus?: number | string | null;
  lastPing?: number | null;
}

export interface SyncedHeartbeat {
  /** ISO 8601 en UTC. */
  timestamp: string;
  /** Valor numérico de `MonitorStatus` (ver domain/value-objects/monitor-status.ts). */
  status: number;
  ping: number | null;
}

/**
 * Puerto (interfaz) para los llamados salientes que hace esta instancia hacia sus pares
 * federados. `requestEnrollment` es el bootstrap (protegido solo por el token de un solo uso).
 * `listRemoteMonitors`/`syncHeartbeats` presentan el secreto compartido en el header
 * `X-Federation-Secret` contra el mismo puerto principal del par (AZ-049).
 */
export interface IFederationClient {
  requestEnrollment(input: RequestEnrollmentInput): Promise<void>;
  listRemoteMonitors(peer: RemotePeerAddress): Promise<RemoteMonitorSummary[]>;
  /** `since: null` trae todo el historial disponible (solo ocurre en el primer sondeo). */
  syncHeartbeats(peer: RemotePeerAddress, remoteMonitorId: string, since: Date | null): Promise<SyncedHeartbeat[]>;
  /** Notifica al par remoto que la federación ha sido revocada de este lado. */
  notifyRevocation(peer: RemotePeerAddress): Promise<void>;
}
