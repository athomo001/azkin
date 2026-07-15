import {
  IMonitorRepository,
  UpdateMonitorData,
} from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IMonitor } from "../../../domain/entities/monitor";
import { NotFoundError } from "../../../domain/errors/domain-error";

export class UpdateMonitorUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly scheduler: IScheduler,
  ) {}

  async execute(userId: string, id: string, data: UpdateMonitorData): Promise<IMonitor> {
    const updated = await this.monitors.update(userId, id, data);
    if (!updated) {
      throw new NotFoundError("Monitor not found");
    }

    if (updated.isActive) {
      this.scheduler.reschedule(updated);
    } else {
      this.scheduler.unschedule(updated.id);
    }

    return updated;
  }
}
