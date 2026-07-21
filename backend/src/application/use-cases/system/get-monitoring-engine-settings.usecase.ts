// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitoringEngineSettingsRepository } from "../../ports/repositories/monitoring-engine-settings-repository";
import { MonitoringEngineConfig } from "../../ports/services/monitoring-engine-config-resolver";

export interface MonitoringEngineSettingsOutput {
  degradedLatencyMs: number | null; // override activo, o null si usa el valor de entorno
  acceleratedIntervalSeconds: number | null;
  defaults: MonitoringEngineConfig; // valores de .env, para mostrarlos como placeholder/fallback
}

/**
 * Caso de uso para consultar los overrides vigentes de configuración del motor de monitoreo,
 * junto con los valores de `.env` que aplican si no hay override (mismo patrón que
 * `GetAppSmtpChannelUseCase`).
 */
export class GetMonitoringEngineSettingsUseCase {
  constructor(
    private readonly settingsRepo: IMonitoringEngineSettingsRepository,
    private readonly envDefaults: MonitoringEngineConfig,
  ) {}

  async execute(): Promise<MonitoringEngineSettingsOutput> {
    const settings = await this.settingsRepo.getActive();
    return {
      degradedLatencyMs: settings?.degradedLatencyMs ?? null,
      acceleratedIntervalSeconds: settings?.acceleratedIntervalSeconds ?? null,
      defaults: this.envDefaults,
    };
  }
}
