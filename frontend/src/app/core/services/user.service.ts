// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface IViewerPermission {
  type: 'all' | 'group' | 'monitor';
  value?: string;
}

export interface IViewer {
  id: string;
  email?: string;
  username?: string;
  role: string;
  adminId?: string;
  permissions: IViewerPermission[];
  isTvSessionEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/users';

  // Signal reactivo con el listado de Viewers para la UI
  readonly viewers = signal<IViewer[]>([]);

  /**
   * Carga el listado completo de Viewers asociados al Admin autenticado
   */
  loadViewers(): Observable<IViewer[]> {
    return this.http.get<IViewer[]>(this.apiUrl).pipe(
      tap(data => this.viewers.set(data))
    );
  }

  /**
   * Crea un nuevo Viewer de solo lectura con sus permisos iniciales
   */
  createViewer(viewer: Partial<IViewer> & { password?: string }): Observable<IViewer> {
    return this.http.post<IViewer>(this.apiUrl, viewer).pipe(
      tap(created => this.viewers.update(list => [...list, created]))
    );
  }

  /**
   * Actualiza los permisos granulares y configuración de sesión de un Viewer existente
   */
  updatePermissions(id: string, payload: { permissions: IViewerPermission[]; isTvSessionEnabled?: boolean }): Observable<IViewer> {
    return this.http.put<IViewer>(`${this.apiUrl}/${id}/permissions`, payload).pipe(
      tap(updated => this.viewers.update(list =>
        list.map(v => v.id === id ? updated : v)
      ))
    );
  }

  /**
   * Elimina permanentemente a un Viewer del sistema
   */
  deleteViewer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.viewers.update(list => list.filter(v => v.id !== id)))
    );
  }

  /**
   * Crea una nueva cuenta Admin (acceso global, sin permisos granulares).
   * Solo un Admin autenticado puede invocar este endpoint.
   */
  createAdmin(data: { email: string; password: string }): Observable<{ id: string; email: string; role: string }> {
    return this.http.post<{ id: string; email: string; role: string }>(`${this.apiUrl}/admins`, data);
  }

  // Signal reactivo con el listado de administradores del sistema
  readonly admins = signal<{ id: string; email: string; role: string; createdAt: string }[]>([]);

  /**
   * Carga el listado de todas las cuentas Admin del sistema (sin aislamiento por tenant).
   */
  loadAdmins(): Observable<{ id: string; email: string; role: string; createdAt: string }[]> {
    return this.http.get<{ id: string; email: string; role: string; createdAt: string }[]>(`${this.apiUrl}/admins`).pipe(
      tap(data => this.admins.set(data))
    );
  }
}
