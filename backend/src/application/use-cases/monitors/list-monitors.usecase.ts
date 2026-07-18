// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import {
  HeartbeatSummary,
  IHeartbeatRepository,
} from "../../ports/repositories/heartbeat-repository";
import { IMonitor } from "../../../domain/entities/monitor";
import { filterMonitorsByPermission } from "../../services/monitor-access-policy";

export type MonitorWithStatus = IMonitor & HeartbeatSummary;

const EMPTY_SUMMARY: HeartbeatSummary = {
  lastStatus: null,
  lastPing: null,
  uptime24h: null,
  lastErrorMsg: null,
  isLocalNetworkDown: false,
};

/**
 * Caso de uso para listar todos los monitores autorizados para un usuario (Admin o Viewer)
 * junto con sus métricas consolidadas del último heartbeat de las últimas 24h.
 */
export class ListMonitorsUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats: IHeartbeatRepository,
  ) {}

  async execute(
    _userId: string,
    role: string,
    _adminId: string,
    permissions: { type: string; value?: string }[],
  ): Promise<MonitorWithStatus[]> {
    // Sin aislamiento por tenant: se parte siempre del pool global de monitores.
    const allMonitors = await this.monitors.findAll();
    const monitors = filterMonitorsByPermission(allMonitors, role, permissions);

    const summaries = await this.heartbeats.getSummaries(monitors.map((m) => m.id));

    return monitors.map((monitor) => ({
      ...monitor,
      ...(summaries[monitor.id] ?? EMPTY_SUMMARY),
    }));
  }
}
