import { CheckResult, ICheckStrategy } from "../../application/ports/services/check-strategy";
import { IMonitor } from "../../domain/entities/monitor";

export class HttpChecker implements ICheckStrategy {
  readonly type = "http" as const;

  constructor(private readonly timeoutMs = 10_000) {}

  async check(monitor: IMonitor): Promise<CheckResult> {
    const start = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(monitor.target, {
        signal: controller.signal,
        redirect: "follow",
      });
      const ping = Math.round(performance.now() - start);
      // 2xx/3xx se consideran UP (por defecto).
      const ok = res.status < 400;
      return { ok, ping, msg: `${res.status} ${res.statusText}`.trim() };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "request failed";
      return { ok: false, ping: null, msg: reason };
    } finally {
      clearTimeout(timer);
    }
  }
}
