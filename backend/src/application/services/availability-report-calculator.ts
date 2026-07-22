// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { MonitorStatus } from "../../domain/value-objects/monitor-status";

export interface AvailabilityBeat {
  timestamp: Date;
  status: MonitorStatus;
}

export interface AvailabilityStats {
  incidents: number;
  downtimeSeconds: number;
  uptimeRatio: number; // 0..1
}

// Tope de cuánto tiempo puede atribuirse a un solo heartbeat (ver regla de "duración" abajo).
// 30 minutos es muy superior a cualquier intervalo de chequeo real (mínimo 20s, acelerado por
// defecto 15s) — solo entra en juego cuando hay un hueco anormal en el historial (motor de
// monitoreo detenido/reiniciado), no durante operación normal.
const DEFAULT_MAX_INTERVAL_SECONDS = 30 * 60;

/**
 * Calcula incidentes/downtime/uptime de un monitor dentro de `[from, to)` a partir de sus
 * heartbeats crudos (AZ-045). Función pura, sin I/O — el repositorio solo consulta y filtra.
 *
 * Reglas:
 * - Duración de cada heartbeat = hasta el siguiente heartbeat, o hasta `to` para el último,
 *   **acotada a `maxIntervalSeconds`**: si el motor de monitoreo estuvo detenido (reinicio del
 *   backend, mantenimiento del host, etc.) y el hueco entre dos heartbeats es mayor a ese tope,
 *   el exceso se excluye del cálculo por completo — ni suma downtime ni uptime — en vez de
 *   atribuirle todo ese hueco al último estado conocido (bug real detectado en producción: un
 *   heartbeat DOWN justo antes de un reinicio largo del backend inflaba el downtime a horas,
 *   aunque la caída real hubiera durado segundos).
 * - `downtimeSeconds` suma duración completa (ya acotada) de intervalos en DOWN o DEGRADED (sin
 *   crédito parcial — a diferencia de `uptimeRatio`, que sí aplica 0.5 a DEGRADED, igual que
 *   `getSummaries()`, para no divergir del uptime que ya ve el dashboard).
 * - `incidents` cuenta rachas contiguas que entran a DOWN/DEGRADED desde cualquier otro estado;
 *   una racha que alterna DOWN↔DEGRADED sin volver a UP cuenta como 1 solo incidente.
 * - Heartbeats en MAINTENANCE se excluyen por completo (ni incidente ni downtime) — el intervalo
 *   vecino se extiende sobre ellos, simplificación deliberada (evita re-consultar el estado
 *   "real" que hubiera tenido el monitor durante la ventana de mantenimiento).
 * - No se consulta el heartbeat inmediatamente anterior a `from`: el primer heartbeat dentro del
 *   rango siempre puede iniciar una racha nueva.
 */
export function computeAvailabilityStats(
  beats: AvailabilityBeat[],
  from: Date,
  to: Date,
  maxIntervalSeconds: number = DEFAULT_MAX_INTERVAL_SECONDS,
): AvailabilityStats {
  const relevant = beats
    .filter((b) => b.status !== MonitorStatus.MAINTENANCE)
    .slice()
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  let downtimeSeconds = 0;
  let downWeightedSeconds = 0;
  let totalSeconds = 0;
  let incidents = 0;
  let previousWasOutage = false;

  for (let i = 0; i < relevant.length; i++) {
    const beat = relevant[i];
    const start = beat.timestamp < from ? from : beat.timestamp;
    const rawEnd = i + 1 < relevant.length ? relevant[i + 1].timestamp : to;
    const end = rawEnd > to ? to : rawEnd;
    const rawDurationSeconds = Math.max(0, (end.getTime() - start.getTime()) / 1000);
    const durationSeconds = Math.min(rawDurationSeconds, maxIntervalSeconds);

    totalSeconds += durationSeconds;

    const isOutage = beat.status === MonitorStatus.DOWN || beat.status === MonitorStatus.DEGRADED;
    if (isOutage) {
      downtimeSeconds += durationSeconds;
      downWeightedSeconds += beat.status === MonitorStatus.DEGRADED ? durationSeconds * 0.5 : durationSeconds;
      if (!previousWasOutage) incidents += 1;
    }
    previousWasOutage = isOutage;
  }

  const uptimeRatio = totalSeconds === 0 ? 1 : 1 - downWeightedSeconds / totalSeconds;

  return {
    incidents,
    downtimeSeconds: Math.round(downtimeSeconds),
    uptimeRatio,
  };
}
