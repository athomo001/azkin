// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { filterMonitorsByPermission } from "../../services/monitor-access-policy";

export interface RecentEventOutput {
  monitorId: string;
  monitorName: string;
  target: string;
  timestamp: string;
  status: "UP" | "DOWN";
  ping: number | null;
  msg: string | null;
}

/**
 * Caso de uso para obtener los últimos eventos (heartbeats) de los monitores autorizados
 * para un usuario (Admin o Viewer). Reemplaza el acceso directo a Mongoose que antes vivía
 * dentro de `StatsController`, reutilizando la misma política de acceso que
 * `ListMonitorsUseCase`/`GetGroupsUseCase`.
 */
export class GetRecentEventsUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats: IHeartbeatRepository,
  ) {}

  async execute(
    _userId: string,
    role: string,
    _adminId: string,
    permissions: { type: string; value?: string }[],
    limit = 30,
  ): Promise<RecentEventOutput[]> {
    const allMonitors = await this.monitors.findAll();
    const userMonitors = filterMonitorsByPermission(allMonitors, role, permissions);

    const monitorIds = userMonitors.map((m) => m.id);
    if (monitorIds.length === 0) return [];

    const events = await this.heartbeats.findLastEventsForMonitors(monitorIds, limit);
    const monitorsMap = new Map(userMonitors.map((m) => [m.id, m]));

    return events.map((event) => {
      const monitor = monitorsMap.get(event.monitorId);
      return {
        monitorId: event.monitorId,
        monitorName: monitor ? monitor.name : "Monitor Eliminado",
        target: monitor ? monitor.target : "",
        timestamp: event.timestamp.toISOString(),
        status: event.status === 1 ? "UP" : "DOWN",
        ping: event.ping,
        msg: event.msg,
      };
    });
  }
}
