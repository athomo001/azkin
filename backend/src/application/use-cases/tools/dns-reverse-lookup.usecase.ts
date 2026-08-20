// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Resolver } from "dns/promises";
import { getErrorMessage } from "../../services/get-error-message";

export interface DnsReverseLookupInput {
  ip: string;
  resolver?: string;
}

export interface DnsReverseLookupResult {
  ok: boolean;
  hostnames: string[];
  ping: number | null;
  msg: string;
}

/** Resolución PTR puntual (IP → hostname), misma naturaleza de herramienta que DnsLookupUseCase. */
export class DnsReverseLookupUseCase {
  constructor(private readonly timeoutMs = 10_000) {}

  async execute(input: DnsReverseLookupInput): Promise<DnsReverseLookupResult> {
    const start = performance.now();
    const resolver = new Resolver();

    if (input.resolver) {
      resolver.setServers([input.resolver]);
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), this.timeoutMs),
    );

    try {
      const hostnames = await Promise.race([resolver.reverse(input.ip), timeoutPromise]);
      const ping = Math.round(performance.now() - start);

      if (hostnames.length === 0) {
        return { ok: false, hostnames: [], ping, msg: "No se encontró registro PTR para esa IP" };
      }

      return { ok: true, hostnames, ping, msg: `Resuelto: ${hostnames.length} hostname(s)` };
    } catch (error) {
      return { ok: false, hostnames: [], ping: null, msg: getErrorMessage(error, "resolución reversa fallida") };
    }
  }
}
