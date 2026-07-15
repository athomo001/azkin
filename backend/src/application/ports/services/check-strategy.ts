import { IMonitor } from "../../../domain/entities/monitor";
import { MonitorType } from "../../../domain/value-objects/monitor-type";

export interface CheckResult {
  ok: boolean;
  ping: number | null; // latencia en ms
  msg: string | null;
}

export interface ICheckStrategy {
  readonly type: MonitorType;
  check(monitor: IMonitor): Promise<CheckResult>;
}

export interface ICheckerRegistry {
  resolve(type: MonitorType): ICheckStrategy;
}
