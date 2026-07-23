// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import net from "net";
import { getErrorMessage } from "./get-error-message";

export interface TcpReachabilityResult {
  reachable: boolean;
  error?: string;
  latencyMs?: number;
}

/**
 * Chequeo de conectividad puro a nivel TCP (conecta el socket y listo, sin autenticar ni validar
 * nada de capa de aplicación) — usado para responder "¿llegamos o no?" antes de enrolar una
 * instancia federada, o para diagnosticar un par ya enrolado. Deliberadamente no usa HTTP/TLS: a
 * esta altura no hay certificado del par que validar, y evita ambigüedad de proxy/SPA en el
 * puerto web (ver `docs/ARCHITECTURE.md` §14).
 */
export function checkTcpReachability(host: string, port: number, timeoutMs = 5000): Promise<TcpReachabilityResult> {
  const start = Date.now();
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout: timeoutMs });

    const finish = (result: TcpReachabilityResult): void => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.once("connect", () => finish({ reachable: true, latencyMs: Date.now() - start }));
    socket.once("timeout", () =>
      finish({ reachable: false, error: "Tiempo de espera agotado (posible firewall bloqueando el puerto)" }),
    );
    socket.once("error", (err) => finish({ reachable: false, error: getErrorMessage(err) }));
  });
}
