import {
  CheckResult,
  ICheckStrategy,
  ICheckerRegistry,
} from "../../application/ports/services/check-strategy";
import { IMonitor } from "../../domain/entities/monitor";
import { MonitorType } from "../../domain/value-objects/monitor-type";

type LimitFn = <T>(fn: () => Promise<T>) => Promise<T>;

/**
 * Resuelve el checker por tipo y envuelve la ejecución de red en el limitador
 * global de concurrencia (la persistencia queda fuera del cerrojo).
 */
export class CheckerRegistry implements ICheckerRegistry {
  private readonly strategies: Map<MonitorType, ICheckStrategy>;

  constructor(strategies: ICheckStrategy[], private readonly limit: LimitFn) {
    this.strategies = new Map(strategies.map((s) => [s.type, s]));
  }

  resolve(type: MonitorType): ICheckStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`No checker registered for monitor type "${type}"`);
    }
    return {
      type,
      check: (monitor: IMonitor): Promise<CheckResult> =>
        this.limit(() => strategy.check(monitor)),
    };
  }
}
