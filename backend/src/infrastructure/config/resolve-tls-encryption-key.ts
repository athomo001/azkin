// Azkin — Autor: Athan Espinoza (GitHub: athomo001)

const TLS_ENCRYPTION_KEY_REGEX = /^[0-9a-fA-F]{64}$/;

export interface ResolvedTlsEncryptionKey {
  value: string | undefined;
  warning: string | null;
}

/**
 * Valida `AZKIN_TLS_ENCRYPTION_KEY` sin poder tumbar el arranque del backend (AZ-041): a
 * diferencia del resto del schema de `env.ts` (que sí falla rápido con `process.exit(1)`), esta
 * variable alimenta una única función opcional y secundaria (subir certificado TLS desde
 * `/settings`) — un valor mal formado debe deshabilitar esa función con una advertencia, no
 * tumbar el resto de la aplicación (auth, monitoreo, todo).
 */
export function resolveTlsEncryptionKey(raw: string | undefined): ResolvedTlsEncryptionKey {
  if (!raw) return { value: undefined, warning: null };

  if (TLS_ENCRYPTION_KEY_REGEX.test(raw)) {
    return { value: raw, warning: null };
  }

  return {
    value: undefined,
    warning:
      "[env] AZKIN_TLS_ENCRYPTION_KEY no tiene el formato esperado (64 caracteres hexadecimales) — se ignora. " +
      "La función de HTTPS nativo (subir certificado desde /settings) quedará deshabilitada hasta que la corrijas. " +
      "Generar con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
  };
}
