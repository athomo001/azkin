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

  async execute(userId: string, id: string): Promise<void> {
    const exists = await this.notifications.findById(userId, id);
    if (!exists) {
      throw new NotFoundError("Canal de notificación no encontrado");
    }

    // 1. Elimina la notificación del repositorio
    await this.notifications.delete(userId, id);

    // 2. Busca los monitores del usuario y remueve la asociación en cascada
    const userMonitors = await this.monitors.findAllByUser(userId);
    for (const monitor of userMonitors) {
      if (monitor.notificationIds.includes(id)) {
        const filteredIds = monitor.notificationIds.filter((nid) => nid !== id);
        const updated = await this.monitors.update(userId, monitor.id, {
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
