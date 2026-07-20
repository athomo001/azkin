// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";
import { filterMonitorsByPermission } from "../../services/monitor-access-policy";
import { RecentEventOutput } from "./get-recent-events.usecase";

/**
 * Igual que `GetMonitorEventsUseCase` pero para todos los monitores de un Monitor Group a la vez
 * — alimenta la tabla de eventos bajo el gráfico de detalle de grupo.
 */
export class GetGroupEventsUseCase {
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
    durationMs: number,
  ): Promise<RecentEventOutput[]> {
    const allMonitors = await this.monitors.findAll();
    const groupMonitorsUnfiltered = allMonitors.filter((m) => m.group === groupName);
    if (groupMonitorsUnfiltered.length === 0) {
      throw new NotFoundError("Grupo no encontrado");
    }

    const groupMonitors = filterMonitorsByPermission(groupMonitorsUnfiltered, role, permissions);
    if (groupMonitors.length === 0) {
      throw new NotFoundError("Grupo no encontrado");
    }

    const monitorsMap = new Map(groupMonitors.map((m) => [m.id, m]));
    const beats = await this.heartbeats.findHistoryForMonitors(groupMonitors.map((m) => m.id), durationMs);

    return beats.map((beat) => {
      const monitor = monitorsMap.get(beat.monitorId);
      return {
        monitorId: beat.monitorId,
        monitorName: monitor ? monitor.name : "Monitor Eliminado",
        target: monitor ? (monitor.target ?? "") : "",
        timestamp: beat.timestamp.toISOString(),
        status: beat.status === 1 ? "UP" : "DOWN",
        ping: beat.ping,
        msg: beat.msg,
      };
    });
  }
}
