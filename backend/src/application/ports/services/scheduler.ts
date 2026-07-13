import { IMonitor } from "../../../domain/entities/monitor";

export interface IScheduler {
  /** Carga los monitores activos y los agenda (bootstrap). */
  start(): Promise<void>;
  schedule(monitor: IMonitor): void;
  reschedule(monitor: IMonitor): void;
  unschedule(monitorId: string): void;
  stopAll(): void;
}
