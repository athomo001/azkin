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
 */
export function renderTemplate(template: string, context: TemplateContext): string {
  return template.replace(VARIABLE_PATTERN, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(context, key)) {
      return String(context[key]);
    }
    logger.warn(`[Plantillas] Variable desconocida "${key}" en plantilla de notificación`);
    return match;
  });
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
