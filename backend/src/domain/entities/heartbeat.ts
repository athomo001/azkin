import { MonitorStatus } from "../value-objects/monitor-status";

/** Medición append-only: no tiene identidad propia (sin id en el dominio). */
export interface IHeartbeat {
  monitorId: string;
  timestamp: Date;
  status: MonitorStatus;
  ping: number | null; // latencia ms; null cuando DOWN o no medible
  msg: string | null; // "200 - OK", "timeout", ...
  certExpiry?: number | null;
  domainExpiry?: number | null;
  isLocalNetworkDown?: boolean;
}
