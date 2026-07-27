// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Normaliza la dirección pública que un Admin guarda para esta instancia (federación): si no
 * trae esquema (`http://`/`https://`), antepone `https://` — así el campo acepta una IP o
 * dominio simple ("203.0.113.5", "mi-azkin.miempresa.cl") sin obligar a escribir el esquema, pero
 * lo que queda persistido siempre es una URL completa, utilizable tal cual por el resto del
 * código (construir el fetch de enrollment, etc.) sin tener que volver a normalizarla en cada uso.
 */
export function normalizeInstanceUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes("://")) {
    return trimmed;
  }

  // Detectar si especifica un puerto de desarrollo/HTTP (como :3000, :8080, :80) o localhost
  const hasHttpPort = /:(3000|8000|8080|80|5000|8001|8081)\b/.test(trimmed);
  const isLocalHost = /^localhost\b/i.test(trimmed);

  if (hasHttpPort || isLocalHost) {
    return `http://${trimmed}`;
  }

  return `https://${trimmed}`;
}

const DEV_HTTP_PORT_PATTERN = /:(3000|8000|8080|80|5000|8001|8081)\b/;

/**
 * AZ-066: la federación soporta deliberadamente HTTP plano (ver AZ-049 slice 3 — funciona igual
 * con o sin TLS nativo), así que esta función NO bloquea `http://`. Sirve solo para que el
 * llamador decida si vale la pena advertir: una URL ya normalizada que sigue siendo `http://` y
 * no es localhost/un puerto de desarrollo típico implica que el secreto compartido de federación
 * (header `X-Federation-Secret`) viaja sin cifrar en la red.
 */
export function isInsecureFederationUrl(normalizedUrl: string): boolean {
  if (!normalizedUrl.startsWith("http://")) return false;
  const withoutScheme = normalizedUrl.slice("http://".length);
  return !DEV_HTTP_PORT_PATTERN.test(withoutScheme) && !/^localhost\b/i.test(withoutScheme);
}
