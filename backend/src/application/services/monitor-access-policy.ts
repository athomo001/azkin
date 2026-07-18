// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Política de acceso a monitores compartida por todos los casos de uso de lectura.
 * Sin aislamiento por tenant entre Admins (spec/03-modelo-datos.md §8): un Admin ve el pool
 * global completo; un Viewer ve el pool global filtrado por sus permisos granulares
 * (`all` | `group` | `monitor`).
 */
export function filterMonitorsByPermission<T extends { id: string; group: string | null }>(
  monitors: T[],
  role: string,
  permissions: { type: string; value?: string }[],
): T[] {
  if (role !== "viewer") return monitors;

  const hasAllPermission = permissions.some((p) => p.type === "all");
  if (hasAllPermission) return monitors;

  return monitors.filter((monitor) =>
    permissions.some((p) => {
      if (p.type === "monitor" && p.value === monitor.id) return true;
      if (p.type === "group" && monitor.group && p.value === monitor.group) return true;
      return false;
    }),
  );
}
