// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Estado de un check. Numérico para compacidad en la colección time-series.
 */
export enum MonitorStatus {
  DOWN = 0,
  UP = 1,
  PENDING = 2,
  MAINTENANCE = 3,
  DEGRADED = 4,
}

export type EventStatusLabel = "UP" | "DOWN" | "MAINTENANCE" | "DEGRADED";

/**
 * Reduce un status numérico a la etiqueta que consumen las tablas de "eventos recientes"
 * (get-recent-events/get-monitor-events/get-group-events). PENDING se mantiene fuera del
 * alcance de este mapeo (se reduce a "DOWN", igual que antes de AZ-040) — solo se resolvió
 * el caso de MAINTENANCE/DEGRADED para que no se muestren como una caída real.
 */
export function toEventStatusLabel(status: MonitorStatus): EventStatusLabel {
  if (status === MonitorStatus.UP) return "UP";
  if (status === MonitorStatus.MAINTENANCE) return "MAINTENANCE";
  if (status === MonitorStatus.DEGRADED) return "DEGRADED";
  return "DOWN";
}
