// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";

const TLS_ENCRYPTION_KEY_REGEX = /^[0-9a-fA-F]{64}$/;

// Info fija de HKDF (no un secreto): separa este uso derivado de cualquier otro que en el futuro
// también derive una clave de AZKIN_JWT_SECRET, para que nunca coincidan por accidente.
const DERIVED_KEY_INFO = "azkin-tls-encryption-key-v1";

export interface ResolvedTlsEncryptionKey {
  value: string | undefined;
  warning: string | null;
}

/**
 * Deriva determinísticamente una clave de 32 bytes (64 hex) a partir de `AZKIN_JWT_SECRET` vía
 * HKDF-SHA256 — usada como default cuando no se configuró `AZKIN_TLS_ENCRYPTION_KEY` explícita,
 * para que el cifrado en reposo (clave privada TLS, identidad de federación) funcione en cada
 * nodo sin ningún paso manual: `AZKIN_JWT_SECRET` ya es obligatorio y único por instancia. Nota:
 * rotar `AZKIN_JWT_SECRET` también invalida lo cifrado con la clave derivada — quien necesite
 * rotar uno sin el otro debe fijar `AZKIN_TLS_ENCRYPTION_KEY` explícitamente.
 */
function deriveFromJwtSecret(jwtSecret: string): string {
  const derived = crypto.hkdfSync("sha256", Buffer.from(jwtSecret, "utf8"), Buffer.alloc(0), Buffer.from(DERIVED_KEY_INFO, "utf8"), 32);
  return Buffer.from(derived).toString("hex");
}

/**
 * Resuelve `AZKIN_TLS_ENCRYPTION_KEY` sin poder tumbar el arranque del backend (AZ-041): a
 * diferencia del resto del schema de `env.ts` (que sí falla rápido con `process.exit(1)`), un
 * valor explícito mal formado debe deshabilitar el cifrado en reposo con una advertencia, no
 * tumbar el resto de la aplicación (auth, monitoreo, todo). Si la variable no está configurada en
 * absoluto, se deriva automáticamente de `jwtSecret` (ver `deriveFromJwtSecret`) — no hay ningún
 * dato cifrado previo con el que esa derivación pueda entrar en conflicto, porque sin la variable
 * (ni una derivación) esta función nunca estuvo disponible.
 */
export function resolveTlsEncryptionKey(raw: string | undefined, jwtSecret: string): ResolvedTlsEncryptionKey {
  if (!raw) return { value: deriveFromJwtSecret(jwtSecret), warning: null };

  if (TLS_ENCRYPTION_KEY_REGEX.test(raw)) {
    return { value: raw, warning: null };
  }

  return {
    value: undefined,
    warning:
      "[env] AZKIN_TLS_ENCRYPTION_KEY no tiene el formato esperado (64 caracteres hexadecimales) — se ignora. " +
      "La función de HTTPS nativo (subir certificado desde /settings) quedará deshabilitada hasta que la corrijas o quites la variable. " +
      "Generar con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
  };
}
