// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { CheckResult, ICheckStrategy } from "../../application/ports/services/check-strategy";
import { IMonitor } from "../../domain/entities/monitor";
import { Resolver } from "dns/promises";
import { promise as pingPromise } from "ping";
import { getErrorMessage } from "../../application/services/get-error-message";

/**
 * Estrategia de chequeo para resoluciones DNS (DnsChecker).
 * Realiza una consulta dirigida a un resolver específico (ej: 8.8.8.8) para validar que
 * un hostname resuelva de forma correcta a un tipo de registro (A, AAAA, MX, TXT, CNAME).
 *
 * La consulta en sí es el criterio real de arriba/abajo (si resuelve, el servidor está bien).
 * Cuando falla, se hace un ping ICMP puntual al servidor solo para enriquecer el mensaje:
 * distingue "el host ni responde" (caída real del equipo/red) de "responde pero la consulta DNS
 * falla igual" (servicio colgado o mal configurado) — exactamente el caso que un monitor de Ping
 * normal no puede detectar por sí solo. Nota: se usa ICMP (igual que PingChecker) y no un sondeo
 * TCP al puerto 53 — se probó esa alternativa y en redes con un proxy/EDR que intercepta tráfico
 * al puerto 53 (común en entornos corporativos) daba "alcanzable" incluso contra IPs inexistentes,
 * un falso positivo inaceptable para esto.
 */
export class DnsChecker implements ICheckStrategy {
  readonly type = "dns" as const;

  constructor(
    private readonly timeoutMs = 15_000,
    private readonly reachabilityTimeoutSeconds = 5,
  ) {}

  async check(monitor: IMonitor): Promise<CheckResult> {
    const start = performance.now();
    const resolver = new Resolver();

    if (monitor.dnsResolver) {
      resolver.setServers([monitor.dnsResolver]);
    }

    const recordType = monitor.dnsRecordType || "A";

    const promise = resolver.resolve(monitor.target, recordType);

    // Control de timeout de 15 segundos
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), this.timeoutMs),
    );

    try {
      const records = await Promise.race([promise, timeoutPromise]);
      const ping = Math.round(performance.now() - start);

      if (!records || (Array.isArray(records) && records.length === 0)) {
        return { ok: false, ping, msg: `No se encontraron registros del tipo ${recordType}` };
      }

      // Devuelve éxito y una descripción ligera de los registros devueltos
      const count = Array.isArray(records) ? records.length : 1;
      return { ok: true, ping, msg: `Resuelto: ${count} registro(s) tipo ${recordType}` };
    } catch (error) {
      const queryError = getErrorMessage(error, "resolución fallida");
      const msg = monitor.dnsResolver
        ? await this.describeFailure(monitor.dnsResolver, queryError)
        : queryError;
      return { ok: false, ping: null, msg };
    }
  }

  /** Ante una consulta fallida, agrega el resultado de un ping ICMP al mensaje para indicar si el
   * problema es de alcance (host caído) o del propio servicio DNS (host vivo pero no resuelve).
   * No cambia el veredicto arriba/abajo — solo lo explica mejor. */
  private async describeFailure(host: string, queryError: string): Promise<string> {
    const reachable = await this.probeReachability(host, this.reachabilityTimeoutSeconds);
    return reachable
      ? `Servidor DNS alcanzable (responde ping), pero la consulta DNS falló — ${queryError}`
      : `Servidor DNS no alcanzable (sin respuesta a ping) — ${queryError}`;
  }

  private async probeReachability(host: string, timeoutSeconds: number): Promise<boolean> {
    try {
      const res = await pingPromise.probe(host, { timeout: timeoutSeconds });
      return res.alive;
    } catch {
      return false;
    }
  }
}
