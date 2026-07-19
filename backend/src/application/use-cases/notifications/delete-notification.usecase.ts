// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para eliminar un canal de notificación.
 * Remueve la notificación de la persistencia y la desvincula en cascada de los monitores asociados.
 */
export class DeleteNotificationUseCase {
  constructor(
    private readonly notifications: INotificationRepository,
    private readonly monitors: IMonitorRepository,
    private readonly scheduler: IScheduler,
  ) {}

  async execute(id: string): Promise<void> {
    const exists = await this.notifications.findById(id);
    if (!exists) {
      throw new NotFoundError("Canal de notificación no encontrado");
    }

    // 1. Elimina la notificación del repositorio
    await this.notifications.delete(id);

    // 2. Busca todos los monitores (sin aislamiento por tenant) y remueve la asociación en cascada
    const allMonitors = await this.monitors.findAll();
    for (const monitor of allMonitors) {
      if (monitor.notificationIds.includes(id)) {
        const filteredIds = monitor.notificationIds.filter((nid) => nid !== id);
        const updated = await this.monitors.update(monitor.id, {
          notificationIds: filteredIds,
        });
        
        if (updated) {
          if (updated.isActive) {
            this.scheduler.reschedule(updated);
          } else {
            this.scheduler.unschedule(updated.id);
          }
        }
      }
    }
  }
}
