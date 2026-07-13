/**
 * Estado de un check. Numérico para compacidad en la colección time-series.
 */
export enum MonitorStatus {
  DOWN = 0,
  UP = 1,
  PENDING = 2,
  MAINTENANCE = 3,
}
