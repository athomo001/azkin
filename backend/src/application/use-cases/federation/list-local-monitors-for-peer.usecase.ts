import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { RemoteMonitorSummary } from "../../ports/services/federation-client";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";

/**
 * Lado que **responde** a `GET /federation/monitors` en el listener mTLS (AZ-049, slice 2):
 * cualquier instancia ya enrolada (validada por `verifyPeerCertificate` antes de llegar acá)
 * puede explorar el catálogo de monitores locales — mismo nivel de confianza "todo o nada" del
 * enrollment, sin una ACL granular por monitor (ver Descripción de AZ-049 en ISSUES.md).
 */
export class ListLocalMonitorsForPeerUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats?: IHeartbeatRepository,
  ) {}

  async execute(): Promise<RemoteMonitorSummary[]> {
    const monitors = await this.monitors.findAll();
    const ids = monitors.map((m) => m.id);
    const summaries = this.heartbeats ? await this.heartbeats.getSummaries(ids) : {};

    return monitors.map((m) => {
      const summary = summaries[m.id];
      return {
        id: m.id,
        name: m.name,
        type: m.type,
        target: m.target,
        lastStatus: summary?.lastStatus ?? null,
        lastPing: summary?.lastPing ?? null,
      };
    });
  }
}
