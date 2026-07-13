import { IMonitorRepository } from "../../ports/repositories/monitor-repository";

export class GetTagsUseCase {
  constructor(private readonly monitors: IMonitorRepository) {}

  execute(userId: string): Promise<string[]> {
    return this.monitors.distinctTags(userId);
  }
}
