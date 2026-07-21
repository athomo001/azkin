// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export type MaintenanceScopeType = "all" | "group" | "monitor";

export interface IMaintenanceScope {
  type: MaintenanceScopeType;
  value?: string; // nombre de grupo o id de monitor; se omite si type === "all"
}
// Mismo shape que ya usan los permisos de Viewer (`IUserPermission` en
// domain/entities/user.ts + filterMonitorsByPermission) — se reutiliza el mismo
// concepto de alcance granular en vez de inventar uno nuevo.

export type MaintenanceMode = "immediate" | "scheduled";

/**
 * Entidad pura que representa una ventana de mantenimiento (Maintenance) en el dominio de Azkin.
 * Mientras está vigente para un monitor, silencia sus alertas y su heartbeat se persiste como
 * MonitorStatus.MAINTENANCE en vez del resultado real del checker (ver execute-check.usecase.ts).
 */
export interface IMaintenanceWindow {
  id: string;
  createdBy: string; // ID del Admin que la creó (visible a todos los Admins, sin aislamiento por tenant)
  name: string;
  description?: string;
  scope: IMaintenanceScope[];
  mode: MaintenanceMode;
  startAt: Date | null; // null si mode === "immediate"
  endAt: Date | null; // null si mode === "immediate" (cierre manual) o "scheduled" sin fin definido
  closedAt: Date | null; // se setea al cerrar manualmente o al detectar que ya pasó endAt
  createdAt: Date;
  updatedAt: Date;
}
