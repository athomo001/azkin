import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IMonitor } from "../../../domain/entities/monitor";
import { MonitorType } from "../../../domain/value-objects/monitor-type";
import { QuotaExceededError } from "../../../domain/errors/domain-error";
import crypto from "crypto";

export interface CreateMonitorInput {
  userId: string;
  name: string;
  type: MonitorType;
  target: string;
  port?: number;
  interval: number;
  retries: number;
  retryInterval: number;
  group: string | null;
  tags: string[];
  notificationIds: string[];
  keyword?: string;
  keywordMethod?: "presence" | "absence";
  dnsResolver?: string;
  dnsRecordType?: "A" | "AAAA" | "CNAME" | "MX" | "TXT";
  headers?: Record<string, string>;
  userAgent?: string;
  ignoreTls?: boolean;
  integrityEnabled?: boolean;
  integrityProfile?: "static" | "dynamic";
  integrityIgnoredCssSelectors?: string[];
  integrityVisualMasks?: { x: number; y: number; width: number; height: number }[];
  integrityAllowedScripts?: string[];
  integrityThreshold?: number;
}

/**
 * Caso de uso para crear un nuevo monitor de red en el sistema.
 * Valida la cuota máxima de 50 monitores por usuario y registra el check en el programador si está activo.
 */
export class CreateMonitorUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly scheduler: IScheduler,
  ) {}

  async execute(input: CreateMonitorInput): Promise<IMonitor> {
    const userMonitors = await this.monitors.findAllByUser(input.userId);
    if (userMonitors.length >= 50) {
      throw new QuotaExceededError();
    }

    let pushToken: string | undefined;
    if (input.type === "push") {
      pushToken = crypto.randomUUID();
    }

    const monitor = await this.monitors.create({
      ...input,
      pushToken,
    });

    if (monitor.isActive) {
      this.scheduler.schedule(monitor);
    }

    return monitor;
  }
}
