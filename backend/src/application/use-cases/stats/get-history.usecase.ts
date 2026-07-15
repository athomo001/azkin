import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { NotFoundError } from "../../../domain/errors/domain-error";

export class GetHistoryUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats: IHeartbeatRepository,
  ) {}

  async execute(userId: string, monitorId: string): Promise<IHeartbeat[]> {
    // Aislamiento: se verifica la propiedad ANTES de tocar la time-series.
    const monitor = await this.monitors.findById(userId, monitorId);
    if (!monitor) {
      throw new NotFoundError("Monitor not found");
    }
    return this.heartbeats.findLast24h(monitorId);
  }
}
