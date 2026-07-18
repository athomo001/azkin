// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { filterMonitorsByPermission } from "../../services/monitor-access-policy";

/**
 * Caso de uso para obtener el listado de grupos de monitores (distinct) autorizados para el usuario.
 * Sin aislamiento por tenant: parte del pool global y aplica el filtrado granular para Viewers.
 */
export class GetGroupsUseCase {
  constructor(private readonly monitors: IMonitorRepository) {}

  async execute(
    _userId: string,
    role: string,
    _adminId: string,
    permissions: { type: string; value?: string }[],
  ): Promise<string[]> {
    const allMonitors = await this.monitors.findAll();
    const monitors = filterMonitorsByPermission(allMonitors, role, permissions);

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
