// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { INotifier } from "../../ports/services/notifier";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";
import { IMonitor } from "../../../domain/entities/monitor";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";
import { AlertEventType } from "../../../domain/value-objects/alert-event-type";
import { getErrorMessage } from "../../services/get-error-message";

const EVENT_TO_TRANSITION: Record<AlertEventType, { from: MonitorStatus; to: MonitorStatus }> = {
  DOWN: { from: MonitorStatus.UP, to: MonitorStatus.DOWN },
  RECOVERED: { from: MonitorStatus.DOWN, to: MonitorStatus.UP },
  LATENCY_HIGH: { from: MonitorStatus.UP, to: MonitorStatus.UP },
  DEFACEMENT: { from: MonitorStatus.UP, to: MonitorStatus.UP },
};

/**
 * Caso de uso para disparar un mensaje de prueba a través de un canal de notificación específico,
 * permitiendo validar sus credenciales, accesibilidad y la plantilla configurada para un evento dado.
 */
export class TestNotificationUseCase {
  constructor(
    private readonly notifications: INotificationRepository,
    private readonly notifier: INotifier,
  ) {}

  async execute(userId: string, id: string, eventType: AlertEventType = "DOWN"): Promise<void> {
    const notification = await this.notifications.findById(id);
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

    const { from, to } = EVENT_TO_TRANSITION[eventType];
    const dummyBeat: IHeartbeat = {
      monitorId: "test-monitor-id",
      timestamp: new Date(),
      status: to,
      ping: 42,
      msg: "Mensaje de prueba exitoso: Canal de notificación operativo",
    };

    try {
      await this.notifier.notify({
        notificationId: id,
        eventType,
        monitor: dummyMonitor,
        from,
        to,
        beat: dummyBeat,
        isTest: true,
      });
    } catch (err) {
      throw new ValidationError(`Error al enviar la notificación de prueba: ${getErrorMessage(err)}`);
    }
  }
}
