import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import {
  HeartbeatSummary,
  IHeartbeatRepository,
} from "../../ports/repositories/heartbeat-repository";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";
import { NotFoundError } from "../../../domain/errors/domain-error";
import { MonitorWithStatus } from "../monitors/list-monitors.usecase";

export interface AggregatedPoint {
  timestamp: Date;
  upRatio: number; // 0..1
  avgPing: number | null;
}

export interface TagOverview {
  tag: string;
  overallStatus: MonitorStatus;
  avgPing: number | null;
  monitors: MonitorWithStatus[];
  history: AggregatedPoint[];
}

const HOUR_MS = 60 * 60 * 1000;
const EMPTY_SUMMARY: HeartbeatSummary = { lastStatus: null, lastPing: null, uptime24h: null };

export class GetTagOverviewUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats: IHeartbeatRepository,
  ) {}

  async execute(userId: string, tagName: string): Promise<TagOverview> {
    const all = await this.monitors.findAllByUser(userId);
    const tagged = all.filter((m) => m.tags.includes(tagName));
    if (tagged.length === 0) {
      throw new NotFoundError("Tag not found");
    }

    const summaries = await this.heartbeats.getSummaries(tagged.map((m) => m.id));
    const monitors: MonitorWithStatus[] = tagged.map((m) => ({
      ...m,
      ...(summaries[m.id] ?? EMPTY_SUMMARY),
    }));

    const beatsPerMonitor = await Promise.all(
      tagged.map((m) => this.heartbeats.findLast24h(m.id)),
    );

    return {
      tag: tagName,
      overallStatus: this.combineStatus(monitors),
      avgPing: this.averagePing(monitors),
      monitors,
      history: this.aggregateHourly(beatsPerMonitor.flat()),
    };
  }

  /** El peor estado confirmado domina: DOWN > PENDING > UP. Sin datos → PENDING. */
  private combineStatus(monitors: MonitorWithStatus[]): MonitorStatus {
    const statuses = monitors
      .map((m) => m.lastStatus)
      .filter((s): s is MonitorStatus => s !== null);
    if (statuses.length === 0) return MonitorStatus.PENDING;
    if (statuses.includes(MonitorStatus.DOWN)) return MonitorStatus.DOWN;
    if (statuses.includes(MonitorStatus.PENDING)) return MonitorStatus.PENDING;
    return MonitorStatus.UP;
  }

  private averagePing(monitors: MonitorWithStatus[]): number | null {
    const pings = monitors
      .map((m) => m.lastPing)
      .filter((p): p is number => p !== null);
    if (pings.length === 0) return null;
    return Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
  }

  /** Agrupa los latidos del grupo en buckets horarios (24 puntos). */
  private aggregateHourly(beats: IHeartbeat[]): AggregatedPoint[] {
    const buckets = new Map<number, { total: number; ups: number; pingSum: number; pingCount: number }>();

    for (const beat of beats) {
      const key = Math.floor(beat.timestamp.getTime() / HOUR_MS) * HOUR_MS;
      const bucket = buckets.get(key) ?? { total: 0, ups: 0, pingSum: 0, pingCount: 0 };
      bucket.total += 1;
      if (beat.status === MonitorStatus.UP) {
        bucket.ups += 1;
        if (beat.ping !== null) {
          bucket.pingSum += beat.ping;
          bucket.pingCount += 1;
        }
      }
      buckets.set(key, bucket);
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a - b)
      .map(([key, b]) => ({
        timestamp: new Date(key),
        upRatio: b.total === 0 ? 0 : b.ups / b.total,
        avgPing: b.pingCount === 0 ? null : Math.round(b.pingSum / b.pingCount),
      }));
  }
}
