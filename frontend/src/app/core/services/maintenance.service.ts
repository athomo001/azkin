// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type MaintenanceScopeType = 'all' | 'group' | 'monitor';
export type MaintenanceMode = 'immediate' | 'scheduled';

export interface IMaintenanceScope {
  type: MaintenanceScopeType;
  value?: string;
}

export interface IMaintenanceWindow {
  id: string;
  name: string;
  description: string | null;
  scope: IMaintenanceScope[];
  mode: MaintenanceMode;
  startAt: string | null;
  endAt: string | null;
  closedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateMaintenanceWindow {
  name: string;
  description?: string;
  scope: IMaintenanceScope[];
  mode: MaintenanceMode;
  startAt?: string;
  endAt?: string;
}

export interface IUpdateMaintenanceWindow {
  name?: string;
  description?: string;
  scope?: IMaintenanceScope[];
  startAt?: string;
  endAt?: string;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/maintenance';

  readonly windows = signal<IMaintenanceWindow[]>([]);

  loadWindows(): Observable<IMaintenanceWindow[]> {
    return this.http.get<IMaintenanceWindow[]>(this.apiUrl).pipe(
      tap((data) => this.windows.set(data)),
    );
  }

  create(data: ICreateMaintenanceWindow): Observable<IMaintenanceWindow> {
    return this.http.post<IMaintenanceWindow>(this.apiUrl, data).pipe(
      tap((created) => this.windows.update((list) => [created, ...list])),
    );
  }

  update(id: string, data: IUpdateMaintenanceWindow): Observable<IMaintenanceWindow> {
    return this.http.put<IMaintenanceWindow>(`${this.apiUrl}/${id}`, data).pipe(
      tap((updated) => this.windows.update((list) => list.map((w) => (w.id === id ? updated : w)))),
    );
  }

  end(id: string): Observable<IMaintenanceWindow> {
    return this.http.post<IMaintenanceWindow>(`${this.apiUrl}/${id}/end`, {}).pipe(
      tap((closed) => this.windows.update((list) => list.map((w) => (w.id === id ? closed : w)))),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.windows.update((list) => list.filter((w) => w.id !== id))),
    );
  }
}
