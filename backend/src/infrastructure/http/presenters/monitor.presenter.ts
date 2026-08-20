// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitor } from "../../../domain/entities/monitor";
import { HeartbeatSummary } from "../../../application/ports/repositories/heartbeat-repository";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { GroupOverview } from "../../../application/use-cases/stats/get-group-overview.usecase";
import { maskSecret } from "../../../application/services/notification-secrets";

/**
 * Mapea una entidad Monitor y su resumen de estado a un DTO de respuesta HTTP limpio y serializable.
 *
 * `role` (AZ-062): un Admin sigue viendo las credenciales SNMP (`SENSITIVE_MONITOR_FIELDS` en
 * monitor-secrets.ts) en texto plano — las necesita para editar el monitor, mismo criterio que ya
 * aplica notification-secrets.ts al propio formulario de edición; cualquier otro rol (Viewer,
 * incluso con permiso sobre ese monitor puntual) las recibe enmascaradas.
 */
export function toMonitorResponse(monitor: IMonitor & Partial<HeartbeatSummary>, role: string) {
  const maskIfNeeded = (value: string | undefined | null): string | null => {
    if (!value) return value ?? null;
    return role === "admin" ? value : maskSecret(value);
  };
  return {
    id: monitor.id,
    name: monitor.name,
    type: monitor.type,
    target: monitor.target,
    port: monitor.port,
    portProtocol: monitor.portProtocol ?? "tcp",
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
    lastCheckedAt: monitor.lastCheckedAt ? monitor.lastCheckedAt.toISOString() : null,
    lastOutageStartedAt: monitor.lastOutageStartedAt ? monitor.lastOutageStartedAt.toISOString() : null,

    // SNMP fields — snmpCommunity/snmpV3AuthKey/snmpV3PrivKey son credenciales (AZ-062): se
    // enmascaran salvo para un Admin (ver maskIfNeeded arriba).
    snmpVersion: monitor.snmpVersion ?? null,
    snmpCommunity: maskIfNeeded(monitor.snmpCommunity),
    snmpPort: monitor.snmpPort ?? null,
    snmpOid: monitor.snmpOid ?? null,
    snmpV3Username: monitor.snmpV3Username ?? null,
    snmpV3AuthProtocol: monitor.snmpV3AuthProtocol ?? null,
    snmpV3AuthKey: maskIfNeeded(monitor.snmpV3AuthKey),
    snmpV3PrivProtocol: monitor.snmpV3PrivProtocol ?? null,
    snmpV3PrivKey: maskIfNeeded(monitor.snmpV3PrivKey),

    // SSL and Domain Expiration
    certExpiry: monitor.certExpiry ?? null,
    certExpiryAt: monitor.certExpiryAt ? monitor.certExpiryAt.toISOString() : null,
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
export function toGroupOverviewResponse(overview: GroupOverview, role: string) {
  return {
    group: overview.group,
    overallStatus: overview.overallStatus,
    avgPing: overview.avgPing,
    monitors: overview.monitors.map((m) => toMonitorResponse(m, role)),
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
