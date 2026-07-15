import { MonitorType } from "../value-objects/monitor-type";

export interface IMonitor {
  id: string;
  userId: string;
  name: string;
  type: MonitorType;
  target: string; // URL (http) | host/IP (ping, port)
  port?: number; // requerido solo cuando type === "port"
  interval: number; // segundos entre checks (mínimo 20)
  retries: number; // reintentos antes de marcar DOWN (0 = inmediato)
  retryInterval: number; // segundos entre reintentos, en estado PENDING
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
