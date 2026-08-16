// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IThemeModeSettingsRepository } from "../../ports/repositories/theme-mode-settings-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IThemeModeSettings } from "../../../domain/entities/theme-mode-settings";

/**
 * Caso de uso para fijar qué Modos Temáticos quedan deshabilitados globalmente (ej. ocultar
 * "uma" hasta que tenga contenido real) — configuración de admin, no una preferencia por usuario.
 */
export class SetThemeModeSettingsUseCase {
  constructor(
    private readonly settingsRepo: IThemeModeSettingsRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, disabledModeIds: string[]): Promise<IThemeModeSettings> {
    const settings = await this.settingsRepo.upsert({ disabledModeIds, updatedById: actorId });

    await this.auditLog.record({
      actorId,
      action: "THEME_MODE_SETTINGS_SET",
      targetType: "theme-mode-settings",
      metadata: { disabledModeIds },
    });

    return settings;
  }
}
