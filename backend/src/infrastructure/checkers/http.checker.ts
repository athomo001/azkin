// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import tls from "tls";
import { Agent, fetch as undiciFetch } from "undici";
import { CheckResult, ICheckStrategy } from "../../application/ports/services/check-strategy";
import { IMonitor } from "../../domain/entities/monitor";
import { HOST_GATEWAY_HOSTNAME, shouldAttemptHostGatewayFallback } from "./same-host-fallback";

/**
 * `fetch()` (undici) siempre lanza un `TypeError` genérico con mensaje "fetch failed" — la causa
 * real (DNS, TLS, conexión rechazada) queda en `.cause`. Sin desenvolver esto, un certificado
 * autofirmado/vencido/de una CA interna no confiada por el contenedor se reporta con el mismo
 * mensaje opaco que un timeout o un host inexistente, obligando a revisar logs del servidor para
 * poder diagnosticar. Este helper expone el mensaje real de la causa cuando existe.
 */
export function extractFetchErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const cause = (error as { cause?: unknown }).cause;
    if (cause instanceof Error && cause.message) return cause.message;
    return error.message;
  }
  return "request failed";
}

/**
 * Consulta de manera nativa los días restantes para la caducidad del certificado SSL.
 * Evita la importación de dependencias externas complejas.
 */
function getSslExpiryDays(host: string, port = 443): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect({
        host,
        port,
        servername: host,
        rejectUnauthorized: false
      }, () => {
        const cert = socket.getPeerCertificate();
        socket.destroy();
        if (cert && cert.valid_to) {
          const expiryDate = new Date(cert.valid_to);
          const diffMs = expiryDate.getTime() - Date.now();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          resolve(diffDays);
        } else {
          resolve(null);
        }
      });
      socket.on("error", () => {
        socket.destroy();
        resolve(null);
      });
      socket.setTimeout(4000, () => {
        socket.destroy();
        resolve(null);
      });
    } catch {
      resolve(null);
    }
  });
}

/**
 * Estrategia de chequeo para peticiones HTTP/HTTPS (HttpChecker).
 * Soporta headers dinámicos, evasión de WAF de Cloudflare, bypass de certificados SSL (ignoreTls),
 * búsqueda de palabras clave de integridad en el HTML de respuesta y cálculo de expiración de certificados y dominios.
 */
export class HttpChecker implements ICheckStrategy {
  readonly type = "http" as const;

  constructor(private readonly timeoutMs = 15_000) {} // Timeout máximo de 15 segundos según spec

  async check(monitor: IMonitor): Promise<CheckResult> {
    const start = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    // Evasión de WAF de Cloudflare por defecto si no hay User-Agent configurado
    const defaultUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const headers: Record<string, string> = {
      "User-Agent": monitor.userAgent || defaultUserAgent,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      ...monitor.headers,
    };

    // Despachador de undici para ignorar validación TLS si ignoreTls === true. `undici` es
    // dependencia explícita del backend (antes se hacía `require("undici")` en runtime sin
    // declararlo en package.json — el módulo no existía en node_modules, así que este bloque
    // fallaba en silencio y `ignoreTls` nunca tuvo efecto real desde que existe la función).
    const dispatcher = monitor.ignoreTls
      ? new Agent({ connect: { rejectUnauthorized: false } })
      : undefined;

    // Calcular días SSL y Dominio de forma segura en paralelo a la petición
    let certExpiry: number | null = null;
    let domainExpiry: number | null = null;
    
    if (monitor.target && monitor.target.toLowerCase().startsWith("https://")) {
      try {
        const urlObj = new URL(monitor.target);
        certExpiry = await getSslExpiryDays(urlObj.hostname, urlObj.port ? Number(urlObj.port) : 443);
      } catch {
        // Ignorar errores menores
      }
    }
    // domainExpiry (vencimiento de dominio vía WHOIS/RDAP) no está implementado — se
    // deja explícitamente en null en vez de fabricar un número determinista a partir de un hash
    // del hostname (bug real detectado en auditoría: presentaba un valor falso como si fuera un
    // dato real de WHOIS). El frontend debe mostrar "N/D" para `domainExpiry === null`.
    domainExpiry = null;

    try {
      const res = await undiciFetch(monitor.target, {
        signal: controller.signal,
        redirect: "follow",
        headers,
        dispatcher,
      });

      const ping = Math.round(performance.now() - start);
      
      // Códigos 2xx y 3xx (menos de 400) se consideran UP
      let ok = res.status < 400;

      // Si retorna 403 o 503 de Cloudflare, se considera UP porque el proxy/WAF de Cloudflare
      // está respondiendo activamente (si el servidor de origen estuviera caído, Cloudflare retornaría 521/522/etc).
      const isCloudflare = res.headers.get("server")?.toLowerCase().includes("cloudflare") ||
                           res.headers.get("cf-ray") !== null ||
                           res.headers.get("cf-cache-status") !== null;

      let msg = `${res.status} ${res.statusText}`.trim();
      if (!ok && isCloudflare && (res.status === 403 || res.status === 503)) {
        ok = true;
        msg = `Operativo (CF WAF - ${res.status})`;
      }

      if (!ok) {
        return { ok: false, ping, msg, certExpiry, domainExpiry };
      }

      // Validación de Palabra Clave (HTTP Keyword) si está configurada
      if (monitor.keyword) {
        const bodyText = await res.text();
        const contains = bodyText.includes(monitor.keyword);

        if (monitor.keywordMethod === "absence" && contains) {
          return { ok: false, ping, msg: `Keyword found: "${monitor.keyword}"`, certExpiry, domainExpiry };
        }
        if ((!monitor.keywordMethod || monitor.keywordMethod === "presence") && !contains) {
          return { ok: false, ping, msg: `Keyword not found: "${monitor.keyword}"`, certExpiry, domainExpiry };
        }
      }

      return { ok: true, ping, msg, certExpiry, domainExpiry };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { ok: false, ping: null, msg: "timeout", certExpiry, domainExpiry };
      }

      const fallback = await this.tryHostGatewayFallback(monitor, error, headers, dispatcher, start);
      if (fallback) return { ...fallback, certExpiry, domainExpiry };

      return { ok: false, ping: null, msg: extractFetchErrorMessage(error), certExpiry, domainExpiry };
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Monitorear un servicio que corre en el mismo servidor físico que Azkin (otro contenedor
   * suelto, otro docker compose, o un proceso nativo) puede fallar si se usa la IP LAN del
   * servidor como target: un contenedor no siempre puede alcanzarla, según el firewall/red del
   * host — aunque el servicio esté perfectamente arriba. Si el error es de conexión (no una
   * respuesta HTTP real) y el target es una IP privada (o el monitor marcó explícitamente
   * `sameHostAsAzkin`, para cubrir un dominio/hostname que resuelve al propio servidor),
   * reintenta una sola vez contra el mismo puerto/ruta vía HOST_GATEWAY_HOSTNAME (ver
   * same-host-fallback.ts) antes de declarar caído. Devuelve null si el fallback no aplica o
   * tampoco funcionó — el llamador cae al mensaje de error original.
   */
  private async tryHostGatewayFallback(
    monitor: IMonitor,
    originalError: unknown,
    headers: Record<string, string>,
    dispatcher: Agent | undefined,
    start: number,
  ): Promise<CheckResult | null> {
    const code = (originalError as { cause?: { code?: string } })?.cause?.code;

    let fallbackUrl: URL;
    try {
      fallbackUrl = new URL(monitor.target);
    } catch {
      return null;
    }
    if (!shouldAttemptHostGatewayFallback(fallbackUrl.hostname, monitor.sameHostAsAzkin, code)) return null;
    fallbackUrl.hostname = HOST_GATEWAY_HOSTNAME;

    const fallbackController = new AbortController();
    const fallbackTimer = setTimeout(() => fallbackController.abort(), 5_000);
    try {
      const res = await undiciFetch(fallbackUrl.toString(), {
        signal: fallbackController.signal,
        redirect: "follow",
        headers,
        dispatcher,
      });
      if (res.status >= 400) return null;
      const ping = Math.round(performance.now() - start);
      const msg = `${res.status} ${res.statusText}`.trim() +
        ` (vía ${HOST_GATEWAY_HOSTNAME}: ${monitor.target} no alcanzable directamente desde el contenedor)`;
      return { ok: true, ping, msg };
    } catch {
      return null;
    } finally {
      clearTimeout(fallbackTimer);
    }
  }
}
