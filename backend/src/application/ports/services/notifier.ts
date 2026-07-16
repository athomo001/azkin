import { IMonitor } from "../../../domain/entities/monitor";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";

export interface NotificationEvent {
  notificationId: string; // ID de la configuración de notificación específica a disparar
  monitor: IMonitor;
  from: MonitorStatus;
  to: MonitorStatus;
  beat: IHeartbeat;
}

/**
 * Puerto (interfaz) para el servicio de envío de alertas multicanal.
 * Desacopla las transiciones de estado de los checkers de las integraciones de mensajería.
 */
export interface INotifier {
  notify(event: NotificationEvent): Promise<void>;
}
