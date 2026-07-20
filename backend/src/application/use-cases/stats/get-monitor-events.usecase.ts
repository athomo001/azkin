// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";
import { filterMonitorsByPermission } from "../../services/monitor-access-policy";
import { RecentEventOutput } from "./get-recent-events.usecase";

/**
 * Caso de uso para obtener los eventos (heartbeats individuales, con mensaje de error) de UN
 * monitor dentro de una ventana de tiempo — a diferencia de `GetHistoryUseCase` (pensado para el
 * gráfico, sin `msg`), esto alimenta la tabla de eventos bajo el gráfico de detalle de monitor.
 */
export class GetMonitorEventsUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats: IHeartbeatRepository,
  ) {}

  async execute(
    _userId: string,
    role: string,
    _adminId: string,
    permissions: { type: string; value?: string }[],
    monitorId: string,
    durationMs: number,
  ): Promise<RecentEventOutput[]> {
    const monitor = await this.monitors.findById(monitorId);
    if (!monitor) {
      throw new NotFoundError("Monitor no encontrado");
    }
    if (filterMonitorsByPermission([monitor], role, permissions).length === 0) {
      throw new NotFoundError("Monitor no encontrado");
    }

    const beats = await this.heartbeats.findHistoryForMonitors([monitorId], durationMs);

    return beats.map((beat) => ({
      monitorId: monitor.id,
      monitorName: monitor.name,
      target: monitor.target ?? "",
      timestamp: beat.timestamp.toISOString(),
      status: beat.status === 1 ? "UP" : "DOWN",
      ping: beat.ping,
      msg: beat.msg,
    }));
  }
}
