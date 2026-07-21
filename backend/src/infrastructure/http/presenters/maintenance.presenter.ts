// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMaintenanceWindow } from "../../../domain/entities/maintenance-window";

export function toMaintenanceWindowResponse(window: IMaintenanceWindow) {
  const now = Date.now();
  const isActive =
    window.closedAt === null &&
    (window.mode === "immediate" ||
      (window.startAt !== null &&
        window.endAt !== null &&
        window.startAt.getTime() <= now &&
        now <= window.endAt.getTime()));

  return {
    id: window.id,
    name: window.name,
    description: window.description ?? null,
    scope: window.scope,
    mode: window.mode,
    startAt: window.startAt ? window.startAt.toISOString() : null,
    endAt: window.endAt ? window.endAt.toISOString() : null,
    closedAt: window.closedAt ? window.closedAt.toISOString() : null,
    isActive,
    createdAt: window.createdAt.toISOString(),
    updatedAt: window.updatedAt.toISOString(),
  };
}
