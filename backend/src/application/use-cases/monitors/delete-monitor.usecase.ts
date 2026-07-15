import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { NotFoundError } from "../../../domain/errors/domain-error";

export class DeleteMonitorUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats: IHeartbeatRepository,
    private readonly scheduler: IScheduler,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    const monitor = await this.monitors.findById(userId, id);
    if (!monitor) {
      throw new NotFoundError("Monitor not found");
    }

    this.scheduler.unschedule(id);
    await this.monitors.delete(userId, id);
    await this.heartbeats.deleteByMonitor(id); // borrado en cascada
  }
}
