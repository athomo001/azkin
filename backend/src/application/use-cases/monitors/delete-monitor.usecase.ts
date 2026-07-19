// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para eliminar un monitor de red.
 * Detiene su agendamiento en el programador, remueve la configuración e inicia el borrado en cascada de sus heartbeats.
 */
export class DeleteMonitorUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats: IHeartbeatRepository,
    private readonly scheduler: IScheduler,
  ) {}

  async execute(_userId: string, id: string): Promise<void> {
    const monitor = await this.monitors.findById(id);
    if (!monitor) {
      throw new NotFoundError("Monitor no encontrado");
    }

    this.scheduler.unschedule(id);
    await this.monitors.delete(id);
    await this.heartbeats.deleteByMonitor(id); // Borrado en cascada de series de tiempo
  }
}
