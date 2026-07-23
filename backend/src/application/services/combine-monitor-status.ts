// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { MonitorStatus } from "../../domain/value-objects/monitor-status";

/**
 * Combina el estado de un conjunto de entidades (monitores de un Monitor Group, o miembros de un
 * vínculo de federación — AZ-049) en un único "peor caso", con la misma jerarquía de severidad en
 * todo el sistema: `DOWN > DEGRADED > PENDING > MAINTENANCE > UP`. Extraído del método privado
 * `combineStatus` que ya usaba `GetGroupOverviewUseCase`, para no mantener dos reglas de
 * severidad distintas conviviendo en el sistema.
 */
export function combineMonitorStatus(statuses: (MonitorStatus | null)[]): MonitorStatus {
  const present = statuses.filter((s): s is MonitorStatus => s !== null);
  if (present.length === 0) return MonitorStatus.PENDING;
  if (present.includes(MonitorStatus.DOWN)) return MonitorStatus.DOWN;
  // Un monitor degradado (responde pero lento/sobrecargado) pesa más que uno simplemente
  // "chequeando", pero menos que uno realmente caído.
  if (present.includes(MonitorStatus.DEGRADED)) return MonitorStatus.DEGRADED;
  if (present.includes(MonitorStatus.PENDING)) return MonitorStatus.PENDING;
  // Un mantenimiento vigente no debe opacar una caída/pendiente/degradación real de otro
  // miembro (AZ-040), pero sí distinguirse de un conjunto genuinamente "todo arriba".
  if (present.includes(MonitorStatus.MAINTENANCE)) return MonitorStatus.MAINTENANCE;
  return MonitorStatus.UP;
}
