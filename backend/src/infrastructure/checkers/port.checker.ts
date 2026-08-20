// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import net from "net";
import dgram from "dgram";
import { CheckResult, ICheckStrategy } from "../../application/ports/services/check-strategy";
import { IMonitor } from "../../domain/entities/monitor";
import { HOST_GATEWAY_HOSTNAME, shouldAttemptHostGatewayFallback } from "./same-host-fallback";

type AttemptResult = { ok: boolean; msg: string; code?: string };

/**
 * Checker de puerto genérico: IP/hostname + puerto + protocolo (TCP o UDP). No le importa qué
 * aplicación corra ahí (SSH, RDP, SMB, un DNS, lo que sea) — solo confirma si algo escucha.
 */
export class PortChecker implements ICheckStrategy {
  readonly type = "port" as const;

  constructor(private readonly timeoutMs = 10_000) {}

  async check(monitor: IMonitor): Promise<CheckResult> {
    const port = monitor.port ?? 0;
    const protocol = monitor.portProtocol ?? "tcp";
    const start = performance.now();

    const result = await this.attempt(protocol, monitor.target, port, this.timeoutMs);
    if (result.ok) return { ok: true, ping: Math.round(performance.now() - start), msg: result.msg };

    // Ver same-host-fallback.ts: un servicio en el mismo servidor que Azkin puede no ser
    // alcanzable vía su IP LAN desde dentro del contenedor, aunque esté perfectamente arriba.
    if (shouldAttemptHostGatewayFallback(monitor.target, monitor.sameHostAsAzkin, result.code)) {
      const fallback = await this.attempt(protocol, HOST_GATEWAY_HOSTNAME, port, 5_000);
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

  private attempt(protocol: "tcp" | "udp", host: string, port: number, timeoutMs: number): Promise<AttemptResult> {
    return protocol === "udp" ? this.attemptUdp(host, port, timeoutMs) : this.attemptTcp(host, port, timeoutMs);
  }

  private attemptTcp(host: string, port: number, timeoutMs: number): Promise<AttemptResult> {
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

  /**
   * UDP no tiene handshake, así que no hay forma 100% confiable de confirmar "está escuchando"
   * como con TCP. Estrategia: `connect()` (asocia el socket a ese destino, sin tráfico real) y
   * mandar un datagrama vacío. Si llega CUALQUIER respuesta, arriba. Si el SO recibe un ICMP
   * "port unreachable" (surge como error ECONNREFUSED), abajo con certeza. Si no pasa nada
   * dentro del timeout, se asume arriba — mismo criterio que usan los scanners de puertos
   * (nmap reporta ese caso como "open|filtered", nunca como "closed").
   */
  private attemptUdp(host: string, port: number, timeoutMs: number): Promise<AttemptResult> {
    return new Promise((resolve) => {
      const socket = dgram.createSocket("udp4");
      let settled = false;
      let timer: NodeJS.Timeout;

      const finish = (ok: boolean, msg: string, code?: string): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.close();
        resolve({ ok, msg, code });
      };

      timer = setTimeout(() => {
        finish(true, `Sin respuesta de ${host}:${port}/udp en ${timeoutMs}ms (sin rechazo explícito, típico en UDP)`);
      }, timeoutMs);

      socket.on("error", (err: NodeJS.ErrnoException) => finish(false, err.message, err.code));
      socket.on("message", () => finish(true, `Respuesta UDP recibida de ${host}:${port}`));

      socket.connect(port, host, () => {
        socket.send(Buffer.alloc(0), (err) => {
          if (err) finish(false, err.message);
        });
      });
    });
  }
}
