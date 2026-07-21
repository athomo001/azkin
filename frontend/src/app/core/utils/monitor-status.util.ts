// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export type MonitorStatusStr = 'UP' | 'DOWN' | 'PENDING' | 'MAINTENANCE';

/**
 * Normaliza el estado de un monitor/heartbeat recibido del backend (numérico 0/1/2/3 o string)
 * a la representación textual usada en el frontend. Única fuente de verdad —
 * antes duplicada en 8 puntos entre monitor.service.ts y dashboard.ts, con una divergencia real:
 * las variantes de create()/update() omitían la rama explícita de PENDING.
 */
export function normalizeMonitorStatus(raw: unknown): MonitorStatusStr {
  if (raw === 1 || raw === 'UP') return 'UP';
  if (raw === 0 || raw === 'DOWN') return 'DOWN';
  if (raw === 2 || raw === 'PENDING') return 'PENDING';
  if (raw === 3 || raw === 'MAINTENANCE') return 'MAINTENANCE';
  return 'PENDING';
}
