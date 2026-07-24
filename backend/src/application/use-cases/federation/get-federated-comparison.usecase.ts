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
  history: { timestamp: string; ping: number | null }[];
}

export interface FederatedComparisonResult {
  localMonitorId: string;
  local: { status: MonitorStatus | null; ping: number | null };
  localHistory: { timestamp: string; ping: number | null }[];
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

    // Obtener últimos heartbeats locales (últimos 30 min)
    const localBeats = await this.heartbeats.findHistory(localMonitorId, 30 * 60 * 1000);
    const localHistory = localBeats.map((b) => ({ timestamp: b.timestamp.toISOString(), ping: b.ping }));

    const links = await this.links.findByLocalMonitorId(localMonitorId);
    const regions: FederatedComparisonRegion[] = [];

    for (const link of links) {
      const instance = await this.federatedInstances.findById(link.federatedInstanceId);
      // Una federación revocada no debe seguir apareciendo en la vista "Por región"/"Combinado"
      // con datos que ya dejaron de refrescarse (ver AZ-050, observación adjunta al punto 4).
      if (!instance || instance.status !== "enrolled") continue;
      const latest = await this.federatedHeartbeats.findLatest(link.id);
      const historyBeats = await this.federatedHeartbeats.findHistory(link.id, 20);
      const history = historyBeats.map((b) => ({ timestamp: b.timestamp.toISOString(), ping: b.ping }));

      regions.push({
        linkId: link.id,
        federatedInstanceId: link.federatedInstanceId,
        federatedInstanceLabel: instance?.label ?? "(instancia desconocida)",
        status: (latest?.status as MonitorStatus | undefined) ?? null,
        ping: latest?.ping ?? null,
        lastUpdatedAt: latest ? latest.timestamp.toISOString() : null,
        history,
      });
    }

    const combinedStatus = combineMonitorStatus([local.status, ...regions.map((r) => r.status)]);

    return { localMonitorId, local, localHistory, regions, combinedStatus };
  }
}
