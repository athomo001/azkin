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
    userId: string,
    role: string,
    adminId: string,
    permissions: { type: string; value?: string }[],
  ): Promise<MonitorWithStatus[]> {
    // Si es viewer, busca los monitores del Admin propietario, si es admin, los propios
    const ownerId = role === "viewer" ? adminId : userId;
    let monitors = await this.monitors.findAllByUser(ownerId);

    // Si es viewer, filtramos los monitores según sus permisos granulares
    if (role === "viewer") {
      const hasAllPermission = permissions.some((p) => p.type === "all");
      if (!hasAllPermission) {
        monitors = monitors.filter((monitor) => {
          return permissions.some((p) => {
            if (p.type === "monitor" && p.value === monitor.id) {
              return true;
            }
            if (p.type === "group" && monitor.group && p.value === monitor.group) {
              return true;
            }
            return false;
          });
        });
      }
    }

    const summaries = await this.heartbeats.getSummaries(monitors.map((m) => m.id));

    return monitors.map((monitor) => ({
      ...monitor,
      ...(summaries[monitor.id] ?? EMPTY_SUMMARY),
    }));
  }
}
