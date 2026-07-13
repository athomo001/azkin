import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";

export interface HeartbeatSummary {
  lastStatus: MonitorStatus | null;
  lastPing: number | null;
  uptime24h: number | null; // ratio 0..1
}

export interface IHeartbeatRepository {
  save(beat: IHeartbeat): Promise<void>;
  /** Heartbeats de las últimas 24 h, orden ascendente por timestamp. */
  findLast24h(monitorId: string): Promise<IHeartbeat[]>;
  deleteByMonitor(monitorId: string): Promise<void>;
  /** Resumen de estado (última 24 h) por monitor, en una sola agregación. */
  getSummaries(monitorIds: string[]): Promise<Record<string, HeartbeatSummary>>;
}
