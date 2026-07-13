import { promise as pingPromise } from "ping";
import { CheckResult, ICheckStrategy } from "../../application/ports/services/check-strategy";
import { IMonitor } from "../../domain/entities/monitor";

export class PingChecker implements ICheckStrategy {
  readonly type = "ping" as const;

  constructor(private readonly timeoutSeconds = 10) {}

  async check(monitor: IMonitor): Promise<CheckResult> {
    try {
      const res = await pingPromise.probe(monitor.target, { timeout: this.timeoutSeconds });
      if (!res.alive) {
        return { ok: false, ping: null, msg: "host unreachable" };
      }
      const time = typeof res.time === "number" ? res.time : Number(res.time);
      const ping = Number.isFinite(time) ? Math.round(time) : null;
      return { ok: true, ping, msg: `alive (${ping ?? "?"} ms)` };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "ping failed";
      return { ok: false, ping: null, msg: reason };
    }
  }
}
