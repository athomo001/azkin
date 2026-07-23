// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { RemoteMonitorSummary } from "../../ports/services/federation-client";

/**
 * Lado que **responde** a `GET /federation/monitors` en el listener mTLS (AZ-049, slice 2):
 * cualquier instancia ya enrolada (validada por `verifyPeerCertificate` antes de llegar acá)
 * puede explorar el catálogo de monitores locales — mismo nivel de confianza "todo o nada" del
 * enrollment, sin una ACL granular por monitor (ver Descripción de AZ-049 en ISSUES.md).
 */
export class ListLocalMonitorsForPeerUseCase {
  constructor(private readonly monitors: IMonitorRepository) {}

  async execute(): Promise<RemoteMonitorSummary[]> {
    const monitors = await this.monitors.findAll();
    return monitors.map((m) => ({ id: m.id, name: m.name, type: m.type, target: m.target }));
  }
}
