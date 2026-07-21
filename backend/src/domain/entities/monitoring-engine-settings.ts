// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Overrides opcionales sobre las constantes del motor de monitoreo configuradas por `.env`
 * (`AZKIN_DEGRADED_LATENCY_MS`/`AZKIN_ACCELERATED_INTERVAL_SECONDS`). `null` en cualquier campo
 * significa "usar el valor de entorno" — mismo patrón que `AppSmtpSettings`.
 */
export interface IMonitoringEngineSettings {
  id: string;
  degradedLatencyMs: number | null;
  acceleratedIntervalSeconds: number | null;
  updatedAt: Date;
  updatedById: string;
}
