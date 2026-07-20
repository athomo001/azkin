// Azkin — Autor: Athan Espinoza (GitHub: athomo001)

/**
 * Hostname portable que Docker resuelve a la IP del host físico desde dentro
 * de cualquier contenedor (ver 'extra_hosts: host.docker.internal:host-gateway'
 * en compose.yaml/compose.dev.yaml, Docker Engine >= 20.10).
 */
export const HOST_GATEWAY_HOSTNAME = "host.docker.internal";

/**
 * true si `host` es una IP privada (RFC 1918) — candidata a ser el propio servidor
 * donde corre Azkin, o algo en su misma LAN. Este tipo de IP a veces no es alcanzable
 * directamente desde dentro del contenedor según el firewall/red del host (a diferencia
 * de una IP pública, que si no responde casi siempre es porque el servicio real está
 * caído, no un problema de red local) — por eso el fallback a HOST_GATEWAY_HOSTNAME
 * solo se intenta para IPs de este tipo, nunca para hostnames/IPs públicas.
 */
export function isPrivateIpv4(host: string): boolean {
  const match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const octets = match.slice(1, 5).map(Number);
  if (octets.some((n) => n > 255)) return false;
  const [a, b] = octets;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 127;
}

/**
 * true si `code` es un error de conexión de bajo nivel (host/red inalcanzable), no una
 * respuesta HTTP de error ni un problema de contenido — solo estos ameritan reintentar
 * vía HOST_GATEWAY_HOSTNAME, porque son el patrón típico de "esta IP privada no es
 * alcanzable desde el contenedor" en vez de "el servicio realmente está caído".
 */
export function isConnectionLevelError(code: string | undefined): boolean {
  return code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "ENETUNREACH" || code === "EHOSTUNREACH";
}

/**
 * true si corresponde reintentar vía HOST_GATEWAY_HOSTNAME antes de declarar el monitor
 * caído: el fallo debe ser de conexión (nunca ante una respuesta real del servicio, HTTP
 * o de otro tipo) y, además, el target debe ser reconocible como "el propio servidor" —
 * automáticamente si es una IP privada, o explícitamente si `sameHostAsAzkin` fue marcado
 * al configurar el monitor (cubre dominios/hostnames que resuelven al servidor de Azkin,
 * que `isPrivateIpv4` no puede detectar por sí sola).
 */
export function shouldAttemptHostGatewayFallback(
  target: string,
  sameHostAsAzkin: boolean | undefined,
  errorCode: string | undefined,
): boolean {
  if (!isConnectionLevelError(errorCode)) return false;
  return sameHostAsAzkin === true || isPrivateIpv4(target);
}
