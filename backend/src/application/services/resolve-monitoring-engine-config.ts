// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  IMonitoringEngineConfigResolver,
  MonitoringEngineConfig,
} from "../ports/services/monitoring-engine-config-resolver";
import { IMonitoringEngineSettingsRepository } from "../ports/repositories/monitoring-engine-settings-repository";

/**
 * Resuelve la configuración efectiva del motor de monitoreo: el override guardado por un Admin
 * (`IMonitoringEngineSettingsRepository`) si existe, o los valores de `.env` como respaldo.
 *
 * Se cachea por `CACHE_TTL_MS` porque `resolve()` se llama en cada chequeo de cada monitor
 * (potencialmente cientos por minuto) — sin caché sería una consulta a Mongo extra por chequeo
 * para un valor que casi nunca cambia. Un cambio de configuración tarda como máximo ese TTL en
 * aplicarse a chequeos ya en curso.
 */
export class ResolveMonitoringEngineConfig implements IMonitoringEngineConfigResolver {
  private static readonly CACHE_TTL_MS = 30_000;
  private cached: MonitoringEngineConfig | null = null;
  private cachedAt = 0;

  constructor(
    private readonly settingsRepo: IMonitoringEngineSettingsRepository,
    private readonly envDefaults: MonitoringEngineConfig,
  ) {}

  async resolve(): Promise<MonitoringEngineConfig> {
    const now = Date.now();
    if (this.cached && now - this.cachedAt < ResolveMonitoringEngineConfig.CACHE_TTL_MS) {
      return this.cached;
    }

    const settings = await this.settingsRepo.getActive();
    this.cached = {
      degradedLatencyMs: settings?.degradedLatencyMs ?? this.envDefaults.degradedLatencyMs,
      acceleratedIntervalSeconds: settings?.acceleratedIntervalSeconds ?? this.envDefaults.acceleratedIntervalSeconds,
    };
    this.cachedAt = now;
    return this.cached;
  }
}
