import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { NotFoundError } from "../../../domain/errors/domain-error";

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
    userId: string,
    role: string,
    adminId: string,
    permissions: { type: string; value?: string }[],
    monitorId: string,
    durationMs: number = GetHistoryUseCase.DEFAULT_DURATION_MS,
  ): Promise<IHeartbeat[]> {
    // Si es viewer, verifica sobre el Admin propietario, si es admin, los propios
    const ownerId = role === "viewer" ? adminId : userId;
    const monitor = await this.monitors.findById(ownerId, monitorId);
    if (!monitor) {
      throw new NotFoundError("Monitor no encontrado");
    }

    // Validación granular para Viewers
    if (role === "viewer") {
      const hasAllPermission = permissions.some((p) => p.type === "all");
      if (!hasAllPermission) {
        const hasAccess = permissions.some((p) => {
          if (p.type === "monitor" && p.value === monitor.id) {
            return true;
          }
          if (p.type === "group" && monitor.group && p.value === monitor.group) {
            return true;
          }
          return false;
        });

        if (!hasAccess) {
          throw new NotFoundError("Monitor no encontrado");
        }
      }
    }

    return this.heartbeats.findHistory(monitorId, durationMs);
  }
}
