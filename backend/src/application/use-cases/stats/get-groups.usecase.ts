import { IMonitorRepository } from "../../ports/repositories/monitor-repository";

/**
 * Caso de uso para obtener el listado de grupos de monitores (distinct) autorizados para el usuario.
 * Resuelve el aislamiento de datos para Admins y el filtrado granular para Viewers.
 */
export class GetGroupsUseCase {
  constructor(private readonly monitors: IMonitorRepository) {}

  async execute(
    userId: string,
    role: string,
    adminId: string,
    permissions: { type: string; value?: string }[],
  ): Promise<string[]> {
    const ownerId = role === "viewer" ? adminId : userId;
    let monitors = await this.monitors.findAllByUser(ownerId);

    // Filtrado de monitores si el usuario es un Viewer
    if (role === "viewer") {
      const hasAllPermission = permissions.some((p) => p.type === "all");
      if (!hasAllPermission) {
        monitors = monitors.filter((monitor) => {
          return permissions.some((p) => {
            if (p.type === "monitor" && p.value === monitor.id) {
              return true;
            }
            if (p.type === "group" && monitor.group && p.value === monitor.group) {
              return true;
            }
            return false;
          });
        });
      }
    }

    // Extrae los nombres de grupos únicos que no sean nulos
    const uniqueGroups = new Set<string>();
    for (const m of monitors) {
      if (m.group && m.group.trim() !== "") {
        uniqueGroups.add(m.group.trim());
      }
    }

    return Array.from(uniqueGroups);
  }
}
