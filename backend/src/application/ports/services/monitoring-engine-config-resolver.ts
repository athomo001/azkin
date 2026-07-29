// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface MonitoringEngineConfig {
  degradedLatencyMs: number;
  acceleratedIntervalSeconds: number;
  // Guarda anti-flapping (AZ-071): ver ExecuteCheckUseCase.
  flapThreshold: number;
  flapWindowSeconds: number;
}

/**
 * Resuelve la configuración efectiva del motor de monitoreo (override del admin, o el valor de
 * `.env` si no hay override) — se llama en cada chequeo, ver `ExecuteCheckUseCase`.
 */
export interface IMonitoringEngineConfigResolver {
  resolve(): Promise<MonitoringEngineConfig>;
}
