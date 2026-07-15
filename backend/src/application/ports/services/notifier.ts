import { IMonitor } from "../../../domain/entities/monitor";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";

export interface NotificationEvent {
  monitor: IMonitor;
  from: MonitorStatus;
  to: MonitorStatus;
  beat: IHeartbeat;
}

/** Seam de alertas (F1): implementación no-op/log en esta fase. */
export interface INotifier {
  notify(event: NotificationEvent): Promise<void>;
}
