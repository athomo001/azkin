import { IMonitor } from "../../../domain/entities/monitor";
import { MonitorType } from "../../../domain/value-objects/monitor-type";

export interface CreateMonitorData {
  userId: string;
  name: string;
  type: MonitorType;
  target: string;
  port?: number;
  interval: number;
  retries: number;
  retryInterval: number;
  tags: string[];
}

export interface UpdateMonitorData {
  name?: string;
  target?: string;
  port?: number;
  interval?: number;
  retries?: number;
  retryInterval?: number;
  tags?: string[];
  isActive?: boolean;
}

export interface IMonitorRepository {
  create(data: CreateMonitorData): Promise<IMonitor>;
  findAllByUser(userId: string): Promise<IMonitor[]>;
  findById(userId: string, id: string): Promise<IMonitor | null>;
  update(userId: string, id: string, data: UpdateMonitorData): Promise<IMonitor | null>;
  delete(userId: string, id: string): Promise<boolean>;
  /** Contexto de sistema: monitores activos de todos los usuarios (bootstrap del scheduler). */
  findAllActive(): Promise<IMonitor[]>;
  distinctTags(userId: string): Promise<string[]>;
}
