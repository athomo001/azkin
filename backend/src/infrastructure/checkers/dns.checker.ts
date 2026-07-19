// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { CheckResult, ICheckStrategy } from "../../application/ports/services/check-strategy";
import { IMonitor } from "../../domain/entities/monitor";
import { Resolver } from "dns/promises";
import { getErrorMessage } from "../../application/services/get-error-message";

/**
 * Estrategia de chequeo para resoluciones DNS (DnsChecker).
 * Realiza una consulta dirigida a un resolver específico (ej: 8.8.8.8) para validar que
 * un hostname resuelva de forma correcta a un tipo de registro (A, AAAA, MX, TXT, CNAME).
 */
export class DnsChecker implements ICheckStrategy {
  readonly type = "dns" as const;

  constructor(private readonly timeoutMs = 15_000) {}

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
      return { ok: false, ping: null, msg: getErrorMessage(error, "resolución fallida") };
    }
  }
}
