// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IThemeModeSettingsRepository } from "../../ports/repositories/theme-mode-settings-repository";
import { IThemeModesScanner, ThemeModeSummary } from "../../ports/services/theme-modes-scanner";

export type ThemeModeListItem = ThemeModeSummary & { enabled: boolean };

/**
 * Caso de uso que combina el escaneo de `assets/huevo/` con la configuración global de
 * habilitado/deshabilitado del admin. Devuelve TODOS los modos descubiertos, cada uno anotado
 * con `enabled` — este mismo caso de uso alimenta tanto el endpoint público (que filtra y
 * descarta `enabled`) como el endpoint admin (que lo devuelve tal cual), ver
 * `ThemeModeController`.
 */
export class ListThemeModesUseCase {
  constructor(
    private readonly scanner: IThemeModesScanner,
    private readonly settingsRepo: IThemeModeSettingsRepository,
  ) {}

  async execute(): Promise<ThemeModeListItem[]> {
    const [modes, settings] = await Promise.all([this.scanner.listModes(), this.settingsRepo.getActive()]);
    const disabledModeIds = settings?.disabledModeIds ?? [];

    return modes.map((mode) => ({
      ...mode,
      enabled: !disabledModeIds.includes(mode.id),
    }));
  }
}
