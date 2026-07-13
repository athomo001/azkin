export const MONITOR_TYPES = ["http", "ping", "port"] as const;

export type MonitorType = (typeof MONITOR_TYPES)[number];
