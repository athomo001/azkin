// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface CreateFederatedHeartbeatData {
  federatedMonitorLinkId: string;
  timestamp: Date;
  status: number;
  ping: number | null;
}

export interface FederatedHeartbeatSummary {
  timestamp: Date;
  status: number;
  ping: number | null;
}

/**
 * Puerto (interfaz) para la persistencia de los heartbeats recibidos de un par federado, uno por
 * `FederatedMonitorLink` (mismo TTL de 30 días que la colección local de heartbeats — ver
 * AZ-049 en ISSUES.md).
 */
export interface IFederatedHeartbeatRepository {
  insertMany(data: CreateFederatedHeartbeatData[]): Promise<void>;
  findLatest(federatedMonitorLinkId: string): Promise<FederatedHeartbeatSummary | null>;
  findHistory(federatedMonitorLinkId: string, limit?: number): Promise<FederatedHeartbeatSummary[]>;
}
