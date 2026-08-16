// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IThemeModeSettings } from "../../../domain/entities/theme-mode-settings";

export interface UpsertThemeModeSettingsData {
  disabledModeIds: string[];
  updatedById: string;
}

/**
 * Puerto (interfaz) para el singleton de configuración global de Modos Temáticos. Mismo patrón
 * que `IMonitoringEngineSettingsRepository`: un único documento, `getActive()`/`upsert()`.
 */
export interface IThemeModeSettingsRepository {
  getActive(): Promise<IThemeModeSettings | null>;
  upsert(data: UpsertThemeModeSettingsData): Promise<IThemeModeSettings>;
}
