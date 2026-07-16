export const MONITOR_TYPES = ["http", "ping", "port", "dns", "push", "snmp"] as const;

export type MonitorType = (typeof MONITOR_TYPES)[number];
