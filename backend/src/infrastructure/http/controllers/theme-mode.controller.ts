// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { ListThemeModesUseCase, ThemeModeListItem } from "../../../application/use-cases/theme-modes/list-theme-modes.usecase";
import { SetThemeModeSettingsUseCase } from "../../../application/use-cases/theme-modes/set-theme-mode-settings.usecase";

export class ThemeModeController {
  constructor(
    private readonly listThemeModes: ListThemeModesUseCase,
    private readonly setThemeModeSettings: SetThemeModeSettingsUseCase,
    /** Ej. "/theme-assets" — prefijo público servido por `express.static` (ver composition-root.ts). */
    private readonly themeAssetsBaseUrl: string,
  ) {}

  /**
   * Devuelve los modos HABILITADOS, para poblar el menú de cualquier usuario autenticado.
   */
  list = async (_req: Request, res: Response): Promise<void> => {
    const all = await this.listThemeModes.execute();
    const enabled = all
      .filter((m) => m.enabled)
      .map(({ enabled: _enabled, ...rest }) => this.withUrls(rest));
    res.status(200).json(enabled);
  };

  /**
   * Igual que `list`, pero incluye también los deshabilitados con `enabled: boolean` — para la
   * pantalla de administración.
   */
  listAdmin = async (_req: Request, res: Response): Promise<void> => {
    const all = await this.listThemeModes.execute();
    res.status(200).json(all.map((m) => this.withUrls(m)));
  };

  /**
   * Fija qué modos quedan deshabilitados globalmente (ej. ocultar "uma" hasta que tenga
   * contenido real).
   */
  updateSettings = async (req: Request, res: Response): Promise<void> => {
    const actorId = req.userId!;
    const settings = await this.setThemeModeSettings.execute(actorId, req.body.disabledModeIds);
    res.status(200).json({ success: true, settings });
  };

  private withUrls<T extends { id: string; files: string[] }>(mode: T): Omit<T, "files"> & { files: string[] } {
    return {
      ...mode,
      files: mode.files.map((f) => `${this.themeAssetsBaseUrl}/${mode.id}/${f}`),
    };
  }
}

// Reexportado únicamente para que el tipo quede documentado junto al controller que lo consume.
export type { ThemeModeListItem };
