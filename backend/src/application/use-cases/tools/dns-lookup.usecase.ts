// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Resolver } from "dns/promises";
import { getErrorMessage } from "../../services/get-error-message";

export type DnsToolRecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT";

export interface DnsLookupInput {
  hostname: string;
  resolver?: string;
  recordType?: DnsToolRecordType;
}

export interface DnsLookupResult {
  ok: boolean;
  records: string[];
  ping: number | null;
  msg: string;
}

/**
 * Consulta DNS puntual bajo demanda (herramienta de diagnóstico del navbar) — a diferencia de
 * DnsChecker, no está atada a un IMonitor persistido: se ejecuta una sola vez y no se agenda.
 */
export class DnsLookupUseCase {
  constructor(private readonly timeoutMs = 10_000) {}

  async execute(input: DnsLookupInput): Promise<DnsLookupResult> {
    const start = performance.now();
    const resolver = new Resolver();

    if (input.resolver) {
      resolver.setServers([input.resolver]);
    }

    const recordType = input.recordType || "A";

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), this.timeoutMs),
    );

    try {
      const raw = await Promise.race([resolver.resolve(input.hostname, recordType), timeoutPromise]);
      const ping = Math.round(performance.now() - start);
      const records = this.flatten(raw);

      if (records.length === 0) {
        return { ok: false, records: [], ping, msg: `No se encontraron registros del tipo ${recordType}` };
      }

      return { ok: true, records, ping, msg: `Resuelto: ${records.length} registro(s) tipo ${recordType}` };
    } catch (error) {
      return { ok: false, records: [], ping: null, msg: getErrorMessage(error, "resolución fallida") };
    }
  }

  /** Aplana el resultado heterogéneo de resolver.resolve() (string[], MxRecord[], string[][]...) a texto legible. */
  private flatten(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((entry) => (typeof entry === "string" ? entry : JSON.stringify(entry)));
  }
}
