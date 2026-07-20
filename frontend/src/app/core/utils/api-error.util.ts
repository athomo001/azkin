// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extrae el mensaje legible de una respuesta de error HTTP, alineado al envelope real del
 * backend (`{ error: { code, message, details? } }`, ver spec/04-contratos-api.md §2).
 * Única fuente de verdad — antes había 3 variantes incompatibles entre archivos,
 * una de las cuales (`err?.error?.error` sin `.message`) mostraba literalmente "[object Object]"
 * en el toast cuando el backend sí respondía con el envelope real.
 */
export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (typeof body?.error?.message === 'string') return body.error.message;
    if (typeof body?.message === 'string') return body.message;
  }
  return fallback;
}
