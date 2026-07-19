// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/** Claves de `config` que contienen secretos (nunca deben viajar en texto plano al cliente). */
export const SENSITIVE_NOTIFICATION_CONFIG_KEYS = ["webhookUrl", "botToken", "smtpPassword"] as const;

export const SECRET_MASK_PREFIX = "••••";

/** Enmascara un secreto dejando visibles solo los últimos 4 caracteres (o el prefijo solo si es más corto). */
export function maskSecret(value: string): string {
  if (value.length <= 4) return SECRET_MASK_PREFIX;
  return SECRET_MASK_PREFIX + value.slice(-4);
}
