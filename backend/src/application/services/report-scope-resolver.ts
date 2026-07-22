// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IReportScope } from "../../domain/entities/report-definition";

/**
 * A diferencia de `findActiveMaintenanceForMonitor` (maintenance-scope-policy.ts), que solo
 * responde "¿este monitor cae en el alcance?", un informe necesita la lista completa de monitores
 * dentro de su `scope` para agregarlos — resolución en bloque, no por monitor.
 * Mismo criterio de alcance granular `all`/`group`/`monitor` que Mantenimiento (AZ-040) y los
 * permisos de Viewer.
 */
export function resolveReportScopeMonitors<T extends { id: string; group: string | null }>(
  allMonitors: T[],
  scope: IReportScope[],
): T[] {
  if (scope.some((s) => s.type === "all")) return allMonitors;

  const matchedIds = new Set<string>();
  const result: T[] = [];

  for (const monitor of allMonitors) {
    const matches = scope.some((s) => {
      if (s.type === "monitor" && s.value === monitor.id) return true;
      if (s.type === "group" && monitor.group && s.value === monitor.group) return true;
      return false;
    });
    if (matches && !matchedIds.has(monitor.id)) {
      matchedIds.add(monitor.id);
      result.push(monitor);
    }
  }

  return result;
}
