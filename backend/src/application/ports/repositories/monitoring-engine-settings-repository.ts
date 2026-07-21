// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitoringEngineSettings } from "../../../domain/entities/monitoring-engine-settings";

export interface UpsertMonitoringEngineSettingsData {
  degradedLatencyMs: number | null;
  acceleratedIntervalSeconds: number | null;
  updatedById: string;
}

/**
 * Puerto (interfaz) para el singleton de overrides del motor de monitoreo. Mismo patrón que
 * `IAppSmtpSettingsRepository`: un único documento, `getActive()`/`upsert()`.
 */
export interface IMonitoringEngineSettingsRepository {
  getActive(): Promise<IMonitoringEngineSettings | null>;
  upsert(data: UpsertMonitoringEngineSettingsData): Promise<IMonitoringEngineSettings>;
}
