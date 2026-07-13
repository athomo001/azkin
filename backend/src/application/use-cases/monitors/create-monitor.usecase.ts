import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IMonitor } from "../../../domain/entities/monitor";
import { MonitorType } from "../../../domain/value-objects/monitor-type";

export interface CreateMonitorInput {
  userId: string;
  name: string;
  type: MonitorType;
  target: string;
  port?: number;
  interval: number;
  retries: number;
  retryInterval: number;
  tags: string[];
}

export class CreateMonitorUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly scheduler: IScheduler,
  ) {}

  async execute(input: CreateMonitorInput): Promise<IMonitor> {
    const monitor = await this.monitors.create(input);
    if (monitor.isActive) {
      this.scheduler.schedule(monitor);
    }
    return monitor;
  }
}
