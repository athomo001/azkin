// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitor } from "../../../domain/entities/monitor";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";
import { AlertEventType } from "../../../domain/value-objects/alert-event-type";

export interface NotificationEvent {
  notificationId: string; // ID de la configuración de notificación específica a disparar
  eventType: AlertEventType; // Evento de alerta (para enrutamiento y selección de plantilla, AZ-007)
  monitor: IMonitor;
  from: MonitorStatus;
  to: MonitorStatus;
  beat: IHeartbeat;
  /** Si es true, ignora el filtro de enrutamiento por evento (usado por "enviar prueba"). */
  isTest?: boolean;
}

/**
 * Puerto (interfaz) para el servicio de envío de alertas multicanal.
 * Desacopla las transiciones de estado de los checkers de las integraciones de mensajería.
 */
export interface INotifier {
  notify(event: NotificationEvent): Promise<void>;
}
