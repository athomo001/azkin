// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import tls from "tls";
import { Agent, fetch as undiciFetch } from "undici";
import { CheckResult, ICheckStrategy } from "../../application/ports/services/check-strategy";
import { IMonitor } from "../../domain/entities/monitor";
import { HOST_GATEWAY_HOSTNAME, shouldAttemptHostGatewayFallback } from "./same-host-fallback";

const DAILY_TTL_MS = 24 * 60 * 60 * 1000;
const SSL_TIMEOUT_MS = 4_000;
const RDAP_TIMEOUT_MS = 8_000;

interface CachedEntry<T> {
  value: T;
  fetchedAt: number;
  inFlight?: Promise<T>;
}

interface SslExpiryInfo {
  days: number | null;
  expiresAt: Date | null;
}

interface DomainExpiryInfo {
  days: number | null;
}

const sslExpiryCache = new Map<string, CachedEntry<SslExpiryInfo>>();
const domainExpiryCache = new Map<string, CachedEntry<DomainExpiryInfo>>();

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

function isIpAddress(hostname: string): boolean {
  return /^[\d.]+$/.test(hostname) || hostname.includes(":");
}

function shouldLookupDomainExpiry(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  if (!normalized || !normalized.includes(".")) return false;
  if (normalized === "localhost") return false;
  if (isIpAddress(normalized)) return false;

  const labels = normalized.split(".").filter(Boolean);
  const tld = labels[labels.length - 1];
  if (!tld) return false;

  const reservedTlds = new Set(["localhost", "local", "internal", "test", "example", "invalid"]);
  return !reservedTlds.has(tld);
}

function getCandidateDomains(hostname: string): string[] {
  const normalized = hostname.toLowerCase();
  const labels = normalized.split(".").filter(Boolean);
  const candidates = new Set<string>([normalized]);

  if (labels.length > 2 && labels[0] === "www") {
    candidates.add(labels.slice(1).join("."));
  }
  if (labels.length >= 2) {
    candidates.add(labels.slice(-2).join("."));
  }

  return [...candidates].filter((domain) => shouldLookupDomainExpiry(domain));
}

function computeDaysUntil(date: Date): number {
  const diffMs = date.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

async function withDailyCache<T>(
  map: Map<string, CachedEntry<T>>,
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const cached = map.get(key);
  if (cached && now - cached.fetchedAt < DAILY_TTL_MS) {
    return cached.value;
  }
  if (cached?.inFlight) {
    return cached.inFlight;
  }

  const inFlight = loader()
    .then((value) => {
      map.set(key, { value, fetchedAt: Date.now() });
      return value;
    })
    .catch(() => {
      // Si falla la renovación, no bloquea el check: reutiliza valor previo si existía.
      if (cached) {
        map.set(key, { value: cached.value, fetchedAt: cached.fetchedAt });
        return cached.value;
      }
      throw new Error("cache load failed");
    })
    .finally(() => {
      const current = map.get(key);
      if (current?.inFlight) {
        map.set(key, { value: current.value, fetchedAt: current.fetchedAt });
      }
    });

  map.set(key, {
    value: cached?.value as T,
    fetchedAt: cached?.fetchedAt ?? 0,
    inFlight,
  });

  return inFlight;
}

/**
 * Consulta de manera nativa los días restantes y la fecha de caducidad del certificado SSL.
 */
function getSslExpiryInfo(host: string, port = 443): Promise<SslExpiryInfo> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(
        {
          host,
          port,
          servername: host,
          rejectUnauthorized: false,
        },
        () => {
          const cert = socket.getPeerCertificate();
          socket.destroy();
          if (cert && cert.valid_to) {
            const expiryDate = new Date(cert.valid_to);
            if (Number.isFinite(expiryDate.getTime())) {
              resolve({ days: computeDaysUntil(expiryDate), expiresAt: expiryDate });
              return;
            }
          }
          resolve({ days: null, expiresAt: null });
        },
      );
      socket.on("error", () => {
        socket.destroy();
        resolve({ days: null, expiresAt: null });
      });
      socket.setTimeout(SSL_TIMEOUT_MS, () => {
        socket.destroy();
        resolve({ days: null, expiresAt: null });
      });
    } catch {
      resolve({ days: null, expiresAt: null });
    }
  });
}

function extractRdapExpirationDate(payload: unknown): Date | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as {
    events?: Array<{ eventAction?: string; eventDate?: string }>;
    expirationDate?: string;
    expires?: string;
    registryExpiryDate?: string;
  };

  const directCandidates = [record.expirationDate, record.expires, record.registryExpiryDate]
    .filter((value): value is string => typeof value === "string");
  for (const value of directCandidates) {
    const parsed = new Date(value);
    if (Number.isFinite(parsed.getTime())) return parsed;
  }

  const eventCandidates = (record.events ?? [])
    .filter((evt) => /expir|renew|delete|paid|valid/i.test(evt.eventAction ?? ""))
    .map((evt) => evt.eventDate)
    .filter((value): value is string => typeof value === "string");
  for (const value of eventCandidates) {
    const parsed = new Date(value);
    if (Number.isFinite(parsed.getTime())) return parsed;
  }

  return null;
}

async function queryRdapExpiryDays(domain: string): Promise<DomainExpiryInfo> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RDAP_TIMEOUT_MS);

  try {
    const response = await undiciFetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "Accept": "application/rdap+json, application/json" },
    });

    if (!response.ok) return { days: null };

    const payload = await response.json();
    const expiryDate = extractRdapExpirationDate(payload);
    if (!expiryDate) return { days: null };

    return { days: computeDaysUntil(expiryDate) };
  } catch {
    return { days: null };
  } finally {
    clearTimeout(timer);
  }
}

async function getCachedDomainExpiry(hostname: string): Promise<DomainExpiryInfo> {
  const candidates = getCandidateDomains(hostname);
  for (const domain of candidates) {
    const info = await withDailyCache(domainExpiryCache, domain, async () => queryRdapExpiryDays(domain));
    if (info.days !== null) return info;
  }
  return { days: null };
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

    const defaultUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const headers: Record<string, string> = {
      "User-Agent": monitor.userAgent || defaultUserAgent,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      ...monitor.headers,
    };

    const dispatcher = monitor.ignoreTls
      ? new Agent({ connect: { rejectUnauthorized: false } })
      : undefined;

    // WHOIS/RDAP y expiración SSL no cambian cada 30s; se cachean 24h por host/dominio.
    let certExpiry: number | null = null;
    let certExpiryAt: Date | null = null;
    let domainExpiry: number | null = null;

    let targetUrl: URL | null = null;
    try {
      targetUrl = new URL(monitor.target);
    } catch {
      targetUrl = null;
    }

    if (targetUrl) {
      try {
        if (targetUrl.protocol === "https:") {
          const sslInfo = await withDailyCache(
            sslExpiryCache,
            `${targetUrl.hostname}:${targetUrl.port || "443"}`,
            () => getSslExpiryInfo(targetUrl!.hostname, targetUrl!.port ? Number(targetUrl!.port) : 443),
          );
          certExpiry = sslInfo.days;
          certExpiryAt = sslInfo.expiresAt;
        }
      } catch {
        // Metadata SSL es best-effort; no debe romper el check principal.
      }

      try {
        if (shouldLookupDomainExpiry(targetUrl.hostname)) {
          const domainInfo = await getCachedDomainExpiry(targetUrl.hostname);
          domainExpiry = domainInfo.days;
        }
      } catch {
        // Metadata WHOIS/RDAP es best-effort; no debe romper el check principal.
      }
    }

    try {
      const res = await undiciFetch(monitor.target, {
        signal: controller.signal,
        redirect: "follow",
        headers,
        dispatcher,
      });

      const ping = Math.round(performance.now() - start);
      let ok = res.status < 400;

      const isCloudflare = res.headers.get("server")?.toLowerCase().includes("cloudflare") ||
                           res.headers.get("cf-ray") !== null ||
                           res.headers.get("cf-cache-status") !== null;
      const isVercel = res.headers.get("server")?.toLowerCase().includes("vercel") ||
                       res.headers.get("x-vercel-id") !== null ||
                       res.headers.get("x-vercel-cache") !== null;

      let msg = `${res.status} ${res.statusText}`.trim();
      if (!ok && isCloudflare && (res.status === 403 || res.status === 429 || res.status === 503)) {
        ok = true;
        msg = `Operativo (CF WAF - ${res.status})`;
      } else if (!ok && isVercel && (res.status === 403 || res.status === 429)) {
        ok = true;
        msg = `Operativo (Vercel Edge - ${res.status})`;
      } else if (!ok && isCloudflare && res.status >= 520 && res.status <= 524) {
        msg = `Cloudflare: error de origen (${res.status} ${res.statusText})`.trim();
      }

      if (!ok) {
        return { ok: false, ping, msg, certExpiry, certExpiryAt, domainExpiry };
      }

      if (monitor.keyword) {
        const bodyText = await res.text();
        const contains = bodyText.includes(monitor.keyword);

        if (monitor.keywordMethod === "absence" && contains) {
          return { ok: false, ping, msg: `Keyword found: "${monitor.keyword}"`, certExpiry, certExpiryAt, domainExpiry };
        }
        if ((!monitor.keywordMethod || monitor.keywordMethod === "presence") && !contains) {
          return { ok: false, ping, msg: `Keyword not found: "${monitor.keyword}"`, certExpiry, certExpiryAt, domainExpiry };
        }
      }

      return { ok: true, ping, msg, certExpiry, certExpiryAt, domainExpiry };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { ok: false, ping: null, msg: "timeout", certExpiry, certExpiryAt, domainExpiry };
      }

      const fallback = await this.tryHostGatewayFallback(monitor, error, headers, dispatcher, start);
      if (fallback) return { ...fallback, certExpiry, certExpiryAt, domainExpiry };

      return { ok: false, ping: null, msg: extractFetchErrorMessage(error), certExpiry, certExpiryAt, domainExpiry };
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
