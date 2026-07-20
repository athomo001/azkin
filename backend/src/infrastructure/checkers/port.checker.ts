// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import net from "net";
import { CheckResult, ICheckStrategy } from "../../application/ports/services/check-strategy";
import { IMonitor } from "../../domain/entities/monitor";
import { HOST_GATEWAY_HOSTNAME, shouldAttemptHostGatewayFallback } from "./same-host-fallback";

export class PortChecker implements ICheckStrategy {
  readonly type = "port" as const;

  constructor(private readonly timeoutMs = 10_000) {}

  async check(monitor: IMonitor): Promise<CheckResult> {
    const port = monitor.port ?? 0;
    const start = performance.now();

    const result = await this.attempt(monitor.target, port, this.timeoutMs);
    if (result.ok) return { ok: true, ping: Math.round(performance.now() - start), msg: result.msg };

    // Ver same-host-fallback.ts: un servicio en el mismo servidor que Azkin puede no ser
    // alcanzable vía su IP LAN desde dentro del contenedor, aunque esté perfectamente arriba.
    if (shouldAttemptHostGatewayFallback(monitor.target, monitor.sameHostAsAzkin, result.code)) {
      const fallback = await this.attempt(HOST_GATEWAY_HOSTNAME, port, 5_000);
      if (fallback.ok) {
        return {
          ok: true,
          ping: Math.round(performance.now() - start),
          msg: `Connected to ${monitor.target}:${port} (vía ${HOST_GATEWAY_HOSTNAME}, no alcanzable directamente desde el contenedor)`,
        };
      }
    }

    return { ok: false, ping: null, msg: result.msg };
  }

  private attempt(host: string, port: number, timeoutMs: number): Promise<{ ok: boolean; msg: string; code?: string }> {
    return new Promise((resolve) => {
      const socket = net.createConnection({ host, port });
      let settled = false;

      const finish = (ok: boolean, msg: string, code?: string): void => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve({ ok, msg, code });
      };

      socket.setTimeout(timeoutMs);
      socket.on("connect", () => finish(true, `Connected to ${host}:${port}`));
      socket.on("timeout", () => finish(false, "Connection timeout", "ETIMEDOUT"));
      socket.on("error", (err: NodeJS.ErrnoException) => finish(false, err.message, err.code));
    });
  }
}
