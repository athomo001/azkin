// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Catálogo de eventos de alerta disponibles para enrutamiento y plantillas por canal.
 * LATENCY_HIGH y DEFACEMENT quedan reservados en el catálogo (enrutables/plantillables)
 * aunque todavía no existe un checker que los produzca. DEGRADED sí tiene productor real
 * (ver ExecuteCheckUseCase: heurística post-caída y umbral de latencia alta).
 */
export const ALERT_EVENT_TYPES = ["DOWN", "RECOVERED", "DEGRADED", "LATENCY_HIGH", "DEFACEMENT"] as const;

export type AlertEventType = (typeof ALERT_EVENT_TYPES)[number];

export function isAlertEventType(value: unknown): value is AlertEventType {
  return typeof value === "string" && (ALERT_EVENT_TYPES as readonly string[]).includes(value);
}
