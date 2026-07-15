import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import {
  HeartbeatSummary,
  IHeartbeatRepository,
} from "../../ports/repositories/heartbeat-repository";
import { IMonitor } from "../../../domain/entities/monitor";

export type MonitorWithStatus = IMonitor & HeartbeatSummary;

const EMPTY_SUMMARY: HeartbeatSummary = {
  lastStatus: null,
  lastPing: null,
  uptime24h: null,
};

export class ListMonitorsUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats: IHeartbeatRepository,
  ) {}

  async execute(userId: string): Promise<MonitorWithStatus[]> {
    const monitors = await this.monitors.findAllByUser(userId);
    const summaries = await this.heartbeats.getSummaries(monitors.map((m) => m.id));

    return monitors.map((monitor) => ({
      ...monitor,
      ...(summaries[monitor.id] ?? EMPTY_SUMMARY),
    }));
  }
}
