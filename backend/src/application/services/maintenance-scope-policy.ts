// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMaintenanceWindow } from "../../domain/entities/maintenance-window";

/**
 * Resuelve si un monitor cae dentro del alcance de alguna ventana de mantenimiento ya vigente
 * (ver `IMaintenanceRepository.findActive()` para la vigencia por fecha/cierre). Mismo criterio
 * de alcance granular que `filterMonitorsByPermission` (monitor-access-policy.ts): "all" | "group" | "monitor".
 */
export function findActiveMaintenanceForMonitor<T extends { id: string; group: string | null }>(
  monitor: T,
  activeWindows: IMaintenanceWindow[],
): IMaintenanceWindow | null {
  return (
    activeWindows.find((window) =>
      window.scope.some((s) => {
        if (s.type === "all") return true;
        if (s.type === "monitor" && s.value === monitor.id) return true;
        if (s.type === "group" && monitor.group && s.value === monitor.group) return true;
        return false;
      }),
    ) ?? null
  );
}
