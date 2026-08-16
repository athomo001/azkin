// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Singleton de configuración global de Modos Temáticos: qué modos (carpetas de
 * `assets/huevo/<id>/`) están deshabilitados para todos los usuarios, sin importar la
 * preferencia individual de cada uno (`user.preferences.themeMode`). Mismo patrón que
 * `IMonitoringEngineSettings`.
 */
export interface IThemeModeSettings {
  id: string;
  disabledModeIds: string[];
  updatedAt: Date;
  updatedById: string;
}
