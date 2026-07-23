// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";
import { AvailabilityStats } from "../../services/availability-report-calculator";

export interface HeartbeatSummary {
  lastStatus: MonitorStatus | null;
  lastPing: number | null;
  uptime24h: number | null; // ratio 0..1
  lastErrorMsg: string | null; // último mensaje de error (ej: "502 Bad Gateway" o timeout)
  certExpiry?: number | null;
  domainExpiry?: number | null;
  isLocalNetworkDown?: boolean;
}

export interface RecentEventRecord {
  monitorId: string;
  timestamp: Date;
  status: number;
  ping: number | null;
  msg: string | null;
}

export interface IHeartbeatRepository {
  save(beat: IHeartbeat): Promise<void>;
  /** Heartbeats de las últimas 24 h, orden ascendente por timestamp. */
  findLast24h(monitorId: string): Promise<IHeartbeat[]>;
  /** Obtener el historial filtrado por una duración de tiempo en milisegundos. */
  findHistory(monitorId: string, durationMs: number): Promise<IHeartbeat[]>;
  /** Heartbeats desde un cursor absoluto (AZ-049: responder de `/federation/sync`), orden
   * ascendente. `since: null` trae todo el historial disponible dentro del TTL. */
  findSince(monitorId: string, since: Date | null): Promise<IHeartbeat[]>;
  /**
   * Igual que `findHistory` pero para varios monitores a la vez (ej. todos los de un Monitor
   * Group) — orden descendente por timestamp (más reciente primero), pensado para una tabla de
   * eventos en vez de un gráfico.
   */
  findHistoryForMonitors(monitorIds: string[], durationMs: number): Promise<IHeartbeat[]>;
  deleteByMonitor(monitorId: string): Promise<void>;
  /** Resumen de estado (última 24 h) por monitor, en una sola agregación. */
  getSummaries(monitorIds: string[]): Promise<Record<string, HeartbeatSummary>>;
  /** Últimos N eventos (heartbeats) entre un conjunto de monitores, orden descendente por timestamp. */
  findLastEventsForMonitors(monitorIds: string[], limit: number): Promise<RecentEventRecord[]>;
  /**
   * Incidentes/downtime/uptime de cada monitor dentro de `[from, to)` (AZ-045, informes
   * periódicos). Se llama dos veces por definición de reporte — una para el periodo actual y otra
   * para el periodo anterior equivalente — reutilizando el mismo método con otro rango.
   * `maxIntervalSeconds` acota cuánto se le puede atribuir a un solo heartbeat (ver
   * `computeAvailabilityStats`) — normalmente derivado del intervalo configurado de los monitores
   * del reporte, para no confundir un motor de monitoreo detenido con downtime real.
   */
  getAvailabilityReport(
    monitorIds: string[],
    from: Date,
    to: Date,
    maxIntervalSeconds?: number,
  ): Promise<Record<string, AvailabilityStats>>;
}
