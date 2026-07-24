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
