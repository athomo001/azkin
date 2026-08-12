// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitor } from "../../../domain/entities/monitor";

export interface IScheduler {
  /** Carga los monitores activos y los agenda (bootstrap). */
  start(): Promise<void>;
  schedule(monitor: IMonitor): void;
  reschedule(monitor: IMonitor): void;
  unschedule(monitorId: string): void;
  /** Ejecuta un beat inmediato para un monitor ya agendado, si el scheduler lo soporta. */
  triggerCheck?(monitorId: string): Promise<void>;
  stopAll(): void;
  receivePushHeartbeat(
    monitorId: string,
    clientStatus: "up" | "down",
    clientPing?: number,
    clientMsg?: string,
  ): Promise<void>;
}
