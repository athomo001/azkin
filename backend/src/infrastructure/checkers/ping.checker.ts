// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { promise as pingPromise } from "ping";
import { CheckResult, ICheckStrategy } from "../../application/ports/services/check-strategy";
import { IMonitor } from "../../domain/entities/monitor";
import { HOST_GATEWAY_HOSTNAME, isPrivateIpv4 } from "./same-host-fallback";

export class PingChecker implements ICheckStrategy {
  readonly type = "ping" as const;

  constructor(private readonly timeoutSeconds = 10) {}

  async check(monitor: IMonitor): Promise<CheckResult> {
    try {
      const res = await pingPromise.probe(monitor.target, { timeout: this.timeoutSeconds });
      if (res.alive) {
        const time = typeof res.time === "number" ? res.time : Number(res.time);
        const ping = Number.isFinite(time) ? Math.round(time) : null;
        return { ok: true, ping, msg: `alive (${ping ?? "?"} ms)` };
      }

      // Ver same-host-fallback.ts: un servicio en el mismo servidor que Azkin puede no
      // responder ICMP directamente vía su IP LAN desde dentro del contenedor.
      if (monitor.sameHostAsAzkin === true || isPrivateIpv4(monitor.target)) {
        const fallback = await pingPromise.probe(HOST_GATEWAY_HOSTNAME, { timeout: 5 });
        if (fallback.alive) {
          const time = typeof fallback.time === "number" ? fallback.time : Number(fallback.time);
          const ping = Number.isFinite(time) ? Math.round(time) : null;
          return {
            ok: true,
            ping,
            msg: `alive (${ping ?? "?"} ms, vía ${HOST_GATEWAY_HOSTNAME}, no alcanzable directamente desde el contenedor)`,
          };
        }
      }

      return { ok: false, ping: null, msg: "host unreachable" };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "ping failed";
      return { ok: false, ping: null, msg: reason };
    }
  }
}
