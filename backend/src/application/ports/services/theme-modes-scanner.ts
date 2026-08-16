// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface ThemeModeSummary {
  id: string; // nombre de carpeta (kebab-case), ej. "sonic"
  name: string;
  emoji: string;
  accentColor: string;
  files: string[]; // nombres de archivo únicamente (ej. "sonic-Run.gif") — no URLs completas
}

/**
 * Puerto de infraestructura que descubre los Modos Temáticos disponibles escaneando
 * `AZKIN_THEME_MODES_PATH` (ver spec/07-modos-tematicos.md §5.2). Devuelve TODOS los modos
 * encontrados en disco, sin filtrar por habilitado/deshabilitado — ese filtro es responsabilidad
 * de `ListThemeModesUseCase`, que combina este resultado con `IThemeModeSettingsRepository`.
 */
export interface IThemeModesScanner {
  listModes(): Promise<ThemeModeSummary[]>;
}
