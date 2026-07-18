// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import {
  HeartbeatSummary,
  IHeartbeatRepository,
} from "../../ports/repositories/heartbeat-repository";
import { IMonitor } from "../../../domain/entities/monitor";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";
import { NotFoundError } from "../../../domain/errors/domain-error";
import { filterMonitorsByPermission } from "../../services/monitor-access-policy";

export interface MonitorHistoryPoints {
  monitorId: string;
  monitorName: string;
  points: {
    timestamp: string; // ISO-8601
    status: MonitorStatus;
    ping: number | null;
    isLocalNetworkDown: boolean;
  }[];
}

export interface GroupOverview {
  group: string;
  overallStatus: MonitorStatus;
  avgPing: number | null;
  monitors: (IMonitor & HeartbeatSummary)[];
  history: MonitorHistoryPoints[];
}

const EMPTY_SUMMARY: HeartbeatSummary = {
  lastStatus: null,
  lastPing: null,
  uptime24h: null,
  lastErrorMsg: null,
  isLocalNetworkDown: false,
};

/**
 * Caso de uso para obtener el consolidado de estado y métricas de un Monitor Group.
 * Valida los permisos de acceso del Viewer sobre el grupo o al menos un monitor que lo compone.
 */
export class GetGroupOverviewUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats: IHeartbeatRepository,
  ) {}

  async execute(
    _userId: string,
    role: string,
    _adminId: string,
    permissions: { type: string; value?: string }[],
    groupName: string,
  ): Promise<GroupOverview> {
    const allMonitors = await this.monitors.findAll();
    const groupMonitorsUnfiltered = allMonitors.filter((m) => m.group === groupName);

    if (groupMonitorsUnfiltered.length === 0) {
      throw new NotFoundError("Grupo no encontrado");
    }

    // El viewer debe tener permiso sobre el Monitor Group específico o sobre al menos uno de los monitores que lo contienen
    const groupMonitors = filterMonitorsByPermission(groupMonitorsUnfiltered, role, permissions);
    if (groupMonitors.length === 0) {
      throw new NotFoundError("Grupo no encontrado");
    }

    const summaries = await this.heartbeats.getSummaries(groupMonitors.map((m) => m.id));
    const monitorsWithStatus = groupMonitors.map((m) => ({
      ...m,
      ...(summaries[m.id] ?? EMPTY_SUMMARY),
    }));

    // Obtener historial detallado por monitor (últimas 24h)
    const historyPromises = groupMonitors.map(async (m) => {
      const beats = await this.heartbeats.findLast24h(m.id);
      return {
        monitorId: m.id,
        monitorName: m.name,
        points: beats.map((b) => ({
          timestamp: b.timestamp.toISOString(),
          status: b.status,
          ping: b.ping,
          isLocalNetworkDown: b.isLocalNetworkDown ?? false,
        })),
      };
    });

    const history = await Promise.all(historyPromises);

    return {
      group: groupName,
      overallStatus: this.combineStatus(monitorsWithStatus),
      avgPing: this.averagePing(monitorsWithStatus),
      monitors: monitorsWithStatus,
      history,
    };
  }

  private combineStatus(monitors: (IMonitor & HeartbeatSummary)[]): MonitorStatus {
    const statuses = monitors
      .map((m) => m.lastStatus)
      .filter((s): s is MonitorStatus => s !== null);
    if (statuses.length === 0) return MonitorStatus.PENDING;
    if (statuses.includes(MonitorStatus.DOWN)) return MonitorStatus.DOWN;
    if (statuses.includes(MonitorStatus.PENDING)) return MonitorStatus.PENDING;
    return MonitorStatus.UP;
  }

  private averagePing(monitors: (IMonitor & HeartbeatSummary)[]): number | null {
    const pings = monitors
      .map((m) => m.lastPing)
      .filter((p): p is number => p !== null);
    if (pings.length === 0) return null;
    return Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
  }
}
