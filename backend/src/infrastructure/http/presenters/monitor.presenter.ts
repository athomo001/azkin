import { IMonitor } from "../../../domain/entities/monitor";
import { HeartbeatSummary } from "../../../application/ports/repositories/heartbeat-repository";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { TagOverview } from "../../../application/use-cases/stats/get-tag-overview.usecase";

export function toMonitorResponse(monitor: IMonitor & Partial<HeartbeatSummary>) {
  return {
    id: monitor.id,
    name: monitor.name,
    type: monitor.type,
    target: monitor.target,
    port: monitor.port,
    interval: monitor.interval,
    retries: monitor.retries,
    retryInterval: monitor.retryInterval,
    tags: monitor.tags,
    isActive: monitor.isActive,
    createdAt: monitor.createdAt.toISOString(),
    updatedAt: monitor.updatedAt.toISOString(),
    lastStatus: monitor.lastStatus ?? null,
    lastPing: monitor.lastPing ?? null,
    uptime24h: monitor.uptime24h ?? null,
  };
}

export function toHistoryResponse(monitorId: string, beats: IHeartbeat[]) {
  return {
    monitorId,
    range: "24h" as const,
    points: beats.map((b) => ({
      timestamp: b.timestamp.toISOString(),
      status: b.status,
      ping: b.ping,
    })),
  };
}

export function toTagOverviewResponse(overview: TagOverview) {
  return {
    tag: overview.tag,
    overallStatus: overview.overallStatus,
    avgPing: overview.avgPing,
    monitors: overview.monitors.map(toMonitorResponse),
    history: overview.history.map((p) => ({
      timestamp: p.timestamp.toISOString(),
      upRatio: p.upRatio,
      avgPing: p.avgPing,
    })),
  };
}
