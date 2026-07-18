// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { NotFoundError } from "../../../domain/errors/domain-error";
import { filterMonitorsByPermission } from "../../services/monitor-access-policy";

/**
 * Caso de uso para obtener el historial de heartbeats de las últimas 24h de un monitor.
 * Aplica restricciones estrictas de propiedad para Admins y permisos granulares de lectura para Viewers.
 */
export class GetHistoryUseCase {
  private static readonly DEFAULT_DURATION_MS = 12 * 60 * 60 * 1000;

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
    durationMs: number = GetHistoryUseCase.DEFAULT_DURATION_MS,
  ): Promise<IHeartbeat[]> {
    const monitor = await this.monitors.findById(monitorId);
    if (!monitor) {
      throw new NotFoundError("Monitor no encontrado");
    }

    // Validación granular para Viewers (404 en vez de 403 para no revelar existencia)
    if (filterMonitorsByPermission([monitor], role, permissions).length === 0) {
      throw new NotFoundError("Monitor no encontrado");
    }

    return this.heartbeats.findHistory(monitorId, durationMs);
  }
}
