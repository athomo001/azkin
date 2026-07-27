// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { logger } from "../logger";

export interface TemplateContext {
  [key: string]: string;
  monitor: string;
  monitorId: string;
  monitorType: string;
  url: string;
  status: string;
  previousStatus: string;
  datetime: string;
  httpCode: string;
  ping: string;
  detail: string;
}

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/**
 * Sustituye variables `{{variable}}` de una plantilla contra un contexto tipado.
 * Si una variable no existe en el contexto, se deja intacta y se registra un warning
 * (no debe romper el envío global de la alerta).
 *
 * `escapeValue` (AZ-058/AZ-066) permite escapar cada valor sustituido según el formato de
 * destino de la plantilla — ej. `escapeJsonStringValue` para plantillas de webhook (el texto
 * completo ya es JSON serializado, así que un valor con comillas/backslashes rompería o
 * adulteraría la estructura) o `escapeTelegramMarkdown` para plantillas enviadas con
 * `parse_mode: "Markdown"`. Por defecto no escapa nada (`String(value)`), igual que antes —
 * el comportamiento de los llamadores existentes no cambia si no lo pasan.
 */
export function renderTemplate(
  template: string,
  context: TemplateContext,
  escapeValue: (raw: string) => string = String,
): string {
  return template.replace(VARIABLE_PATTERN, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(context, key)) {
      return escapeValue(String(context[key]));
    }
    logger.warn(`[Plantillas] Variable desconocida "${key}" en plantilla de notificación`);
    return match;
  });
}

/**
 * Escapa un valor para insertarlo como contenido de un string JSON ya serializado (AZ-058) —
 * usado al renderizar la plantilla de un canal tipo webhook, cuyo `body` es el JSON completo con
 * `{{var}}` como placeholders dentro de valores string. `JSON.stringify` produce el string
 * entrecomillado; se recortan las comillas externas porque la plantilla ya las trae.
 */
export function escapeJsonStringValue(raw: string): string {
  return JSON.stringify(raw).slice(1, -1);
}

/** Caracteres especiales del Markdown "clásico" (no MarkdownV2) que usa Telegram `parse_mode:
 * "Markdown"` — escaparlos evita que un nombre de monitor/mensaje con `_`, `*`, `` ` `` o `[`
 * rompa el formato o simule un link falso dentro de la alerta (AZ-066). */
export function escapeTelegramMarkdown(raw: string): string {
  return raw.replace(/([_*`[])/g, "\\$1");
}

export function sampleTemplateContext(): TemplateContext {
  return {
    monitor: "Monitor de ejemplo",
    monitorId: "000000000000000000000000",
    monitorType: "http",
    url: "https://ejemplo.azkin.io",
    status: "DOWN",
    previousStatus: "UP",
    datetime: new Date().toISOString(),
    httpCode: "200",
    ping: "42",
    detail: "Ejemplo de detalle",
  };
}
