// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitor } from "../../../domain/entities/monitor";
import { HeartbeatSummary } from "../../../application/ports/repositories/heartbeat-repository";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { GroupOverview } from "../../../application/use-cases/stats/get-group-overview.usecase";

/**
 * Mapea una entidad Monitor y su resumen de estado a un DTO de respuesta HTTP limpio y serializable.
 */
export function toMonitorResponse(monitor: IMonitor & Partial<HeartbeatSummary>) {
  return {
    id: monitor.id,
    name: monitor.name,
    type: monitor.type,
    target: monitor.target,
    port: monitor.port,
    interval: monitor.interval,
    retries: monitor.retries,
    retryInterval: monitor.retryInterval,
    group: monitor.group ?? null,
    tags: monitor.tags,
    isActive: monitor.isActive,
    notificationIds: monitor.notificationIds,
    ignoreTls: monitor.ignoreTls ?? false,
    sameHostAsAzkin: monitor.sameHostAsAzkin ?? false,
    headers: monitor.headers ?? null,
    userAgent: monitor.userAgent ?? null,
    keyword: monitor.keyword ?? null,
    keywordMethod: monitor.keywordMethod ?? null,
    dnsResolver: monitor.dnsResolver ?? null,
    dnsRecordType: monitor.dnsRecordType ?? null,
    pushToken: monitor.pushToken ?? null,
    createdAt: monitor.createdAt.toISOString(),
    updatedAt: monitor.updatedAt.toISOString(),
    lastStatus: monitor.lastStatus ?? null,
    lastPing: monitor.lastPing ?? null,
    uptime24h: monitor.uptime24h ?? null,
    lastErrorMsg: monitor.lastErrorMsg ?? null,

    // SNMP fields
    snmpVersion: monitor.snmpVersion ?? null,
    snmpCommunity: monitor.snmpCommunity ?? null,
    snmpPort: monitor.snmpPort ?? null,
    snmpOid: monitor.snmpOid ?? null,
    snmpV3Username: monitor.snmpV3Username ?? null,
    snmpV3AuthProtocol: monitor.snmpV3AuthProtocol ?? null,
    snmpV3AuthKey: monitor.snmpV3AuthKey ?? null,
    snmpV3PrivProtocol: monitor.snmpV3PrivProtocol ?? null,
    snmpV3PrivKey: monitor.snmpV3PrivKey ?? null,

    // SSL and Domain Expiration
    certExpiry: monitor.certExpiry ?? null,
    domainExpiry: monitor.domainExpiry ?? null,
    isLocalNetworkDown: monitor.isLocalNetworkDown ?? false,
  };
}

/**
 * Mapea una lista de heartbeats a la estructura del historial de las últimas 24h.
 */
export function toHistoryResponse(monitorId: string, beats: IHeartbeat[]) {
  return {
    monitorId,
    range: "24h" as const,
    points: beats.map((b) => ({
      timestamp: b.timestamp.toISOString(),
      status: b.status,
      ping: b.ping,
      isLocalNetworkDown: b.isLocalNetworkDown ?? false,
    })),
  };
}

/**
 * Formatea el consolidado de estadísticas de un Monitor Group.
 */
export function toGroupOverviewResponse(overview: GroupOverview) {
  return {
    group: overview.group,
    overallStatus: overview.overallStatus,
    avgPing: overview.avgPing,
    monitors: overview.monitors.map(toMonitorResponse),
    history: overview.history.map((h) => ({
      monitorId: h.monitorId,
      monitorName: h.monitorName,
      points: h.points.map((p) => ({
        timestamp: p.timestamp,
        status: p.status,
        ping: p.ping,
        isLocalNetworkDown: (p as any).isLocalNetworkDown ?? false,
      })),
    })),
  };
}
