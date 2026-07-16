import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { INotifier } from "../../ports/services/notifier";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";
import { IMonitor } from "../../../domain/entities/monitor";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";

/**
 * Caso de uso para disparar un mensaje de prueba a través de un canal de notificación específico,
 * permitiendo validar sus credenciales y accesibilidad.
 */
export class TestNotificationUseCase {
  constructor(
    private readonly notifications: INotificationRepository,
    private readonly notifier: INotifier,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    const notification = await this.notifications.findById(userId, id);
    if (!notification) {
      throw new NotFoundError("Canal de notificación no encontrado");
    }

    const dummyMonitor: IMonitor = {
      id: "test-monitor-id",
      userId,
      name: "Monitor de Prueba Azkin",
      type: "http",
      target: "https://ejemplo-prueba.azkin.io",
      interval: 60,
      retries: 0,
      retryInterval: 60,
      group: null,
      tags: ["test"],
      isActive: true,
      notificationIds: [id],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const dummyBeat: IHeartbeat = {
      monitorId: "test-monitor-id",
      timestamp: new Date(),
      status: MonitorStatus.UP,
      ping: 42,
      msg: "Mensaje de prueba exitoso: Canal de notificación operativo",
    };

    try {
      await this.notifier.notify({
        notificationId: id,
        monitor: dummyMonitor,
        from: MonitorStatus.DOWN,
        to: MonitorStatus.UP,
        beat: dummyBeat,
      });
    } catch (err: any) {
      throw new ValidationError(`Error al enviar la notificación de prueba: ${err.message ?? err}`);
    }
  }
}
