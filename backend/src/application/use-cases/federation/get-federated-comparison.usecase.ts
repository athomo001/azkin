// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederatedHeartbeatRepository } from "../../ports/repositories/federated-heartbeat-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { combineMonitorStatus } from "../../services/combine-monitor-status";
import { filterMonitorsByPermission } from "../../services/monitor-access-policy";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";
import { NotFoundError } from "../../../domain/errors/domain-error";

export interface FederatedComparisonRegion {
  linkId: string;
  federatedInstanceId: string;
  federatedInstanceLabel: string;
  status: MonitorStatus | null;
  ping: number | null;
  lastUpdatedAt: string | null;
}

export interface FederatedComparisonResult {
  localMonitorId: string;
  local: { status: MonitorStatus | null; ping: number | null };
  regions: FederatedComparisonRegion[];
  /**
   * Valor derivado, nunca una medición directa — la UI debe etiquetarlo explícitamente como
   * "Combinado" y nunca reemplazar la vista "Por región" (ver AZ-012/AZ-049 en ISSUES.md).
   */
  combinedStatus: MonitorStatus;
}

/**
 * Junta, para un monitor local, su propio estado y el de cada instancia federada vinculada
 * (AZ-049, slice 2) — vista "Por región" siempre disponible, más el combinado bajo la misma
 * jerarquía de severidad que ya usa `GetGroupOverviewUseCase`.
 */
export class GetFederatedComparisonUseCase {
  constructor(
    private readonly links: IFederatedMonitorLinkRepository,
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly federatedHeartbeats: IFederatedHeartbeatRepository,
    private readonly heartbeats: IHeartbeatRepository,
    private readonly monitors: IMonitorRepository,
  ) {}

  async execute(
    role: string,
    permissions: { type: string; value?: string }[],
    localMonitorId: string,
  ): Promise<FederatedComparisonResult> {
    const monitor = await this.monitors.findById(localMonitorId);
    if (!monitor || filterMonitorsByPermission([monitor], role, permissions).length === 0) {
      throw new NotFoundError("Monitor no encontrado");
    }

    const summaries = await this.heartbeats.getSummaries([localMonitorId]);
    const localSummary = summaries[localMonitorId];
    const local = { status: localSummary?.lastStatus ?? null, ping: localSummary?.lastPing ?? null };

    const links = await this.links.findByLocalMonitorId(localMonitorId);
    const regions: FederatedComparisonRegion[] = [];

    for (const link of links) {
      const instance = await this.federatedInstances.findById(link.federatedInstanceId);
      const latest = await this.federatedHeartbeats.findLatest(link.id);
      regions.push({
        linkId: link.id,
        federatedInstanceId: link.federatedInstanceId,
        federatedInstanceLabel: instance?.label ?? "(instancia desconocida)",
        status: (latest?.status as MonitorStatus | undefined) ?? null,
        ping: latest?.ping ?? null,
        lastUpdatedAt: latest ? latest.timestamp.toISOString() : null,
      });
    }

    const combinedStatus = combineMonitorStatus([local.status, ...regions.map((r) => r.status)]);

    return { localMonitorId, local, regions, combinedStatus };
  }
}
