// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";

/**
 * Caso de uso para exportar los monitores configurados como activos portables ("assets"),
 * listos para importarse en otra instancia de Azkin.
 *
 * A diferencia de un respaldo completo (CreateBackupUseCase), que preserva `notificationIds`
 * porque se restaura en la MISMA instancia, aquí se descartan también `notificationIds` y
 * `pushToken`: los canales de notificación de origen no existen en destino, y un pushToken
 * reutilizado entre instancias distintas sería una colisión de identidad, no una migración real.
 */
export class ExportMonitorAssetsUseCase {
  constructor(private readonly monitors: IMonitorRepository) {}

  async execute() {
    const list = await this.monitors.findAll();
    return list.map((m) => {
      const { id, userId, createdAt, updatedAt, notificationIds, pushToken, ...asset } = m;
      return asset;
    });
  }
}
