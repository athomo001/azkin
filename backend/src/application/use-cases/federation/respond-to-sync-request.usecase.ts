// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { SyncedHeartbeat } from "../../ports/services/federation-client";

/**
 * Lado que **responde** a `GET /federation/sync` en el listener mTLS (AZ-049, slice 2): el
 * `monitorId` recibido es un id de monitor LOCAL de esta instancia (desde la perspectiva del
 * peer que pregunta, es su "remoteMonitorId"). Responde a cualquier par ya enrolado, sin ACL
 * granular adicional (ver modelo de confianza en ISSUES.md AZ-049).
 */
export class RespondToSyncRequestUseCase {
  constructor(private readonly heartbeats: IHeartbeatRepository) {}

  async execute(localMonitorId: string, since: Date | null): Promise<SyncedHeartbeat[]> {
    const records = await this.heartbeats.findSince(localMonitorId, since);
    return records.map((r) => ({
      timestamp: r.timestamp.toISOString(),
      status: r.status,
      ping: r.ping,
    }));
  }
}
