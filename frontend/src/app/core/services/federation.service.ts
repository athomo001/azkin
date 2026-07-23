// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type FederatedInstanceStatus = 'enrolled' | 'revoked';

export interface IFederatedInstance {
  id: string;
  label: string;
  remoteUrl: string;
  remoteFederationPort: number;
  peerCertFingerprint: string;
  status: FederatedInstanceStatus;
  createdAt: string;
  revokedAt: string | null;
  lastSuccessfulSyncAt: string | null;
  notifiedDown: boolean;
}

export interface ICreateEnrollmentTokenResult {
  code: string;
  expiresAt: string;
}

export interface IJoinFederation {
  code: string;
  peerLabel: string;
  ownLabel: string;
}

export interface IRemoteMonitorSummary {
  id: string;
  name: string;
  type: string;
  target: string;
}

export interface IFederatedMonitorLink {
  id: string;
  localMonitorId: string;
  federatedInstanceId: string;
  remoteMonitorId: string;
  remoteMonitorLabel: string;
  createdAt: string;
  lastSyncedAt: string | null;
}

export interface ICreateFederatedMonitorLink {
  localMonitorId: string;
  federatedInstanceId: string;
  remoteMonitorId: string;
  remoteMonitorLabel: string;
}

/** Numérico de MonitorStatus (ver backend/src/domain/value-objects/monitor-status.ts). */
export interface IFederatedComparisonRegion {
  linkId: string;
  federatedInstanceId: string;
  federatedInstanceLabel: string;
  status: number | null;
  ping: number | null;
  lastUpdatedAt: string | null;
}

export interface IFederatedComparisonResult {
  localMonitorId: string;
  local: { status: number | null; ping: number | null };
  regions: IFederatedComparisonRegion[];
  combinedStatus: number;
}

export interface IFederationPortStatus {
  port: number;
  isOverridden: boolean;
  listenerActive: boolean;
  listenerPort?: number;
  ownUrl?: string;
}

export interface ITestConnectionResult {
  reachable: boolean;
  error?: string;
  latencyMs?: number;
}

/**
 * Federación de instancias (AZ-049): enrollment, listado/revocación de instancias, exploración de
 * monitores remotos, vínculos de monitoreo y la comparación Por región/Combinado.
 */
@Injectable({ providedIn: 'root' })
export class FederationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/federation';

  readonly instances = signal<IFederatedInstance[]>([]);
  readonly links = signal<IFederatedMonitorLink[]>([]);

  createEnrollmentToken(): Observable<ICreateEnrollmentTokenResult> {
    return this.http.post<ICreateEnrollmentTokenResult>(`${this.apiUrl}/tokens`, {});
  }

  join(data: IJoinFederation): Observable<IFederatedInstance> {
    return this.http.post<IFederatedInstance>(`${this.apiUrl}/instances`, data).pipe(
      tap((created) => this.instances.update((list) => [created, ...list])),
    );
  }

  loadInstances(): Observable<IFederatedInstance[]> {
    return this.http.get<IFederatedInstance[]>(`${this.apiUrl}/instances`).pipe(
      tap((data) => this.instances.set(data)),
    );
  }

  revokeInstance(id: string): Observable<IFederatedInstance> {
    return this.http.delete<IFederatedInstance>(`${this.apiUrl}/instances/${id}`).pipe(
      tap((updated) => this.instances.update((list) => list.map((i) => (i.id === id ? updated : i)))),
    );
  }

  listRemoteMonitors(federatedInstanceId: string): Observable<IRemoteMonitorSummary[]> {
    return this.http.get<IRemoteMonitorSummary[]>(`${this.apiUrl}/instances/${federatedInstanceId}/remote-monitors`);
  }

  loadLinks(localMonitorId?: string): Observable<IFederatedMonitorLink[]> {
    const params: Record<string, string> = localMonitorId ? { monitorId: localMonitorId } : {};
    return this.http.get<IFederatedMonitorLink[]>(`${this.apiUrl}/links`, { params }).pipe(
      tap((data) => this.links.set(data)),
    );
  }

  createLink(data: ICreateFederatedMonitorLink): Observable<IFederatedMonitorLink> {
    return this.http.post<IFederatedMonitorLink>(`${this.apiUrl}/links`, data).pipe(
      tap((created) => this.links.update((list) => [created, ...list])),
    );
  }

  deleteLink(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/links/${id}`).pipe(
      tap(() => this.links.update((list) => list.filter((l) => l.id !== id))),
    );
  }

  getComparison(localMonitorId: string): Observable<IFederatedComparisonResult> {
    return this.http.get<IFederatedComparisonResult>(`${this.apiUrl}/comparison/${localMonitorId}`);
  }

  getPort(): Observable<IFederationPortStatus> {
    return this.http.get<IFederationPortStatus>(`${this.apiUrl}/port`);
  }

  setPort(port: number): Observable<{ port: number; updatedAt: string }> {
    return this.http.put<{ port: number; updatedAt: string }>(`${this.apiUrl}/port`, { port });
  }

  setOwnUrl(ownUrl: string): Observable<{ ownUrl: string; updatedAt: string }> {
    return this.http.put<{ ownUrl: string; updatedAt: string }>(`${this.apiUrl}/own-url`, { ownUrl });
  }

  testAddress(host: string, port: number): Observable<ITestConnectionResult> {
    return this.http.post<ITestConnectionResult>(`${this.apiUrl}/test-connection`, { host, port });
  }

  testInstanceConnection(instanceId: string): Observable<ITestConnectionResult> {
    return this.http.post<ITestConnectionResult>(`${this.apiUrl}/instances/${instanceId}/test-connection`, {});
  }
}
