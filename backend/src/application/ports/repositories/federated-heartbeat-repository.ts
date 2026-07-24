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
  /** Historial dentro de una ventana de tiempo (ms), orden ascendente — mismo criterio que
   * `IHeartbeatRepository.findHistory` para el monitor local, así el selector de rango
   * (5m/30m/1h/.../30d) de la vista "Por región/Combinado" puede pedir la misma ventana a ambos
   * lados (ver AZ-050: antes era un límite fijo de 20 registros, sin selector posible). */
  findHistory(federatedMonitorLinkId: string, durationMs?: number): Promise<FederatedHeartbeatSummary[]>;
}
