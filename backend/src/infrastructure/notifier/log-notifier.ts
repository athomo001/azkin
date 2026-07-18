// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { INotifier, NotificationEvent } from "../../application/ports/services/notifier";
import { MonitorStatus } from "../../domain/value-objects/monitor-status";
import { logger } from "../logger";

/**
 * Implementación de prueba que imprime logs de alertas.
 * Mapeado temporal hasta integrar las estrategias multicanal finales.
 */
export class LogNotifier implements INotifier {
  async notify(event: NotificationEvent): Promise<void> {
    logger.warn(
      `[ALERT] Canal ${event.notificationId} - "${event.monitor.name}" ${MonitorStatus[event.from]} -> ${MonitorStatus[event.to]} (${event.beat.msg ?? "sin mensaje"})`,
    );
  }
}
