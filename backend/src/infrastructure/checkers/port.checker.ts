import net from "net";
import { CheckResult, ICheckStrategy } from "../../application/ports/services/check-strategy";
import { IMonitor } from "../../domain/entities/monitor";

export class PortChecker implements ICheckStrategy {
  readonly type = "port" as const;

  constructor(private readonly timeoutMs = 10_000) {}

  check(monitor: IMonitor): Promise<CheckResult> {
    return new Promise((resolve) => {
      const port = monitor.port ?? 0;
      const start = performance.now();
      const socket = net.createConnection({ host: monitor.target, port });
      let settled = false;

      const finish = (ok: boolean, msg: string): void => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve({ ok, ping: ok ? Math.round(performance.now() - start) : null, msg });
      };

      socket.setTimeout(this.timeoutMs);
      socket.on("connect", () => finish(true, `Connected to ${monitor.target}:${port}`));
      socket.on("timeout", () => finish(false, "Connection timeout"));
      socket.on("error", (err) => finish(false, err.message));
    });
  }
}
