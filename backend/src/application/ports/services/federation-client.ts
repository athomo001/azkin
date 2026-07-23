// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface RequestEnrollmentInput {
  remoteUrl: string;
  token: string;
  callerCertPem: string;
  callerLabel: string;
  callerUrl: string;
  callerFederationPort: number;
}

export interface RequestEnrollmentResult {
  ownCertPem: string;
  ownFederationPort: number;
}

/** Datos mínimos para alcanzar el listener mTLS de un par ya enrolado. */
export interface RemotePeerAddress {
  remoteUrl: string;
  remoteFederationPort: number;
}

export interface RemoteMonitorSummary {
  id: string;
  name: string;
  type: string;
  target: string;
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
 * federados. `requestEnrollment` es el bootstrap (sin certificado de cliente, protegido solo por
 * el token de un solo uso). `listRemoteMonitors`/`syncHeartbeats` sí presentan el certificado
 * propio como client cert (mTLS) contra el listener dedicado del par (AZ-049, slice 2).
 */
export interface IFederationClient {
  requestEnrollment(input: RequestEnrollmentInput): Promise<RequestEnrollmentResult>;
  listRemoteMonitors(peer: RemotePeerAddress): Promise<RemoteMonitorSummary[]>;
  /** `since: null` trae todo el historial disponible (solo ocurre en el primer sondeo). */
  syncHeartbeats(peer: RemotePeerAddress, remoteMonitorId: string, since: Date | null): Promise<SyncedHeartbeat[]>;
}
