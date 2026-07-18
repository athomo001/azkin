// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";

export interface HeartbeatSummary {
  lastStatus: MonitorStatus | null;
  lastPing: number | null;
  uptime24h: number | null; // ratio 0..1
  lastErrorMsg: string | null; // último mensaje de error (ej: "502 Bad Gateway" o timeout)
  certExpiry?: number | null;
  domainExpiry?: number | null;
  isLocalNetworkDown?: boolean;
}

export interface IHeartbeatRepository {
  save(beat: IHeartbeat): Promise<void>;
  /** Heartbeats de las últimas 24 h, orden ascendente por timestamp. */
  findLast24h(monitorId: string): Promise<IHeartbeat[]>;
  /** Obtener el historial filtrado por una duración de tiempo en milisegundos. */
  findHistory(monitorId: string, durationMs: number): Promise<IHeartbeat[]>;
  deleteByMonitor(monitorId: string): Promise<void>;
  /** Resumen de estado (última 24 h) por monitor, en una sola agregación. */
  getSummaries(monitorIds: string[]): Promise<Record<string, HeartbeatSummary>>;
}
