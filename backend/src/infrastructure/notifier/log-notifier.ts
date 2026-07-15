import { INotifier, NotificationEvent } from "../../application/ports/services/notifier";
import { MonitorStatus } from "../../domain/value-objects/monitor-status";
import { logger } from "../logger";

/** Implementación seam: registra la alerta. Sustituible por proveedores reales. */
export class LogNotifier implements INotifier {
  async notify(event: NotificationEvent): Promise<void> {
    logger.warn(
      `[ALERT] "${event.monitor.name}" ${MonitorStatus[event.from]} -> ${MonitorStatus[event.to]} (${event.beat.msg ?? "no message"})`,
    );
  }
}
