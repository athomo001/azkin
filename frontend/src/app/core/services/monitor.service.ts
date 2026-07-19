// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { normalizeMonitorStatus } from '../utils/monitor-status.util';

// Tipos del dominio alineados con el spec (spec/03-modelo-datos.md)
export interface IMonitor {
  id: string;
  userId: string;
  name: string;
  type: 'http' | 'ping' | 'port' | 'dns' | 'push' | 'snmp';
  target?: string;
  port?: number;
  interval: number;
  retries: number;
  timeout: number;
  status: 'UP' | 'DOWN' | 'PENDING';
  lastCheckedAt?: string;
  group?: string;
  tags?: string[];
  isActive: boolean;
  pushToken?: string;
  lastPing?: number;
  uptime24h?: number;
  lastErrorMsg?: string;
  notificationIds?: string[];
  isLocalNetworkDown?: boolean;

  // SNMP Fields
  snmpVersion?: 'v1' | 'v2c' | 'v3';
  snmpCommunity?: string;
  snmpPort?: number;
  snmpOid?: string;
  snmpV3Username?: string;
  snmpV3AuthProtocol?: 'md5' | 'sha';
  snmpV3AuthKey?: string;
  snmpV3PrivProtocol?: 'des' | 'aes';
  snmpV3PrivKey?: string;

  // Cert & Domain Expiry
  certExpiry?: number | null;
  domainExpiry?: number | null;
}

export interface IHeartbeat {
  monitorId: string;
  status: 'UP' | 'DOWN';
  latency?: number;
  message?: string;
  timestamp: string;
  isLocalNetworkDown?: boolean;
}

export interface IMonitorGroup {
  name: string;
  worstStatus: 'UP' | 'DOWN' | 'PENDING';
  avgLatency: number;
  monitors: IMonitor[];
}

/** DTO tal como llega del backend: `lastStatus` en vez del `status` normalizado del dominio. */
type MonitorDto = Omit<IMonitor, 'status'> & { lastStatus: number | string | null };

export interface IHeartbeatEvent {
  monitorId: string;
  status: number | string;
  latency?: number;
  ping?: number;
  msg?: string | null;
  timestamp: string;
  certExpiry?: number | null;
  domainExpiry?: number | null;
  isLocalNetworkDown?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MonitorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1';

  // Signal central de la lista de monitores del admin actual
  readonly monitors = signal<IMonitor[]>([]);
  // Signal de los grupos de monitores (para el GroupDashboard)
  readonly groups = signal<IMonitorGroup[]>([]);

  /**
   * Carga todos los monitores del admin autenticado y actualiza el Signal
   */
  loadMonitors(): Observable<IMonitor[]> {
    return this.http.get<MonitorDto[]>(`${this.apiUrl}/monitors`).pipe(
      map((data) => data.map((m) => ({ ...m, status: normalizeMonitorStatus(m.lastStatus) }))),
      tap((mapped) => this.monitors.set(mapped))
    );
  }

  /**
   * Carga la vista consolidada de grupos de monitores para el dashboard
   */
  loadGroups(): Observable<IMonitorGroup[]> {
    return this.http.get<IMonitorGroup[]>(`/api/v1/stats/groups`).pipe(
      tap(data => this.groups.set(data))
    );
  }

  /**
   * Retorna el historial de heartbeats de un monitor según una ventana de tiempo en ms
   */
  getHistory(monitorId: string, durationMs: number = 12 * 60 * 60 * 1000): Observable<any> {
    return this.http.get<any>(`/api/v1/stats/monitor/${monitorId}/history`, {
      params: { durationMs: String(durationMs) }
    });
  }

  /**
   * Obtiene el resumen detallado de un Monitor Group (gráfico multilínea + caídas)
   */
  getGroupOverview(groupName: string): Observable<any> {
    return this.http.get(`/api/v1/stats/groups/${encodeURIComponent(groupName)}/overview`);
  }

  /**
   * Crea un nuevo monitor y actualiza el Signal local sin recargar todos
   */
  create(monitor: Partial<IMonitor>): Observable<IMonitor> {
    return this.http.post<MonitorDto>(`${this.apiUrl}/monitors`, monitor).pipe(
      map((created) => ({ ...created, status: normalizeMonitorStatus(created.lastStatus) })),
      tap((mapped) => this.monitors.update(list => [...list, mapped]))
    );
  }

  /**
   * Actualiza un monitor existente en el backend y en el Signal local
   */
  update(id: string, monitor: Partial<IMonitor>): Observable<IMonitor> {
    return this.http.put<MonitorDto>(`${this.apiUrl}/monitors/${id}`, monitor).pipe(
      map((updated) => ({ ...updated, status: normalizeMonitorStatus(updated.lastStatus) })),
      tap((mapped) => this.monitors.update(list => list.map(m => m.id === id ? mapped : m)))
    );
  }

  /**
   * Elimina un monitor en el backend y lo remueve del Signal local
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/monitors/${id}`).pipe(
      tap(() => this.monitors.update(list => list.filter(m => m.id !== id)))
    );
  }

  /**
   * Elimina varios monitores en una sola operación (AZ-005).
   */
  bulkDelete(ids: string[]): Observable<{ deletedCount: number; deletedIds: string[] }> {
    return this.http.post<{ deletedCount: number; deletedIds: string[] }>(`${this.apiUrl}/monitors/bulk-delete`, { ids }).pipe(
      tap(({ deletedIds }) => this.monitors.update(list => list.filter(m => !deletedIds.includes(m.id))))
    );
  }

  /**
   * Actualiza el estado de un monitor en el Signal local al recibir eventos de Socket.io
   */
  applyHeartbeat(heartbeat: IHeartbeatEvent): void {
    this.monitors.update(list =>
      list.map(m => {
        if (m.id !== heartbeat.monitorId) return m;

        const statusStr = normalizeMonitorStatus(heartbeat.status);
        return {
          ...m,
          status: statusStr,
          lastCheckedAt: heartbeat.timestamp,
          lastPing: heartbeat.latency ?? heartbeat.ping,
          lastErrorMsg: statusStr === 'DOWN' ? heartbeat.msg ?? undefined : undefined,
          certExpiry: heartbeat.certExpiry !== undefined ? heartbeat.certExpiry : m.certExpiry,
          domainExpiry: heartbeat.domainExpiry !== undefined ? heartbeat.domainExpiry : m.domainExpiry,
          isLocalNetworkDown: heartbeat.isLocalNetworkDown
        };
      })
    );
  }
}
