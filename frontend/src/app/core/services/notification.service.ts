import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface INotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'telegram' | 'discord' | 'webhook';
  config: Record<string, any>;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/notifications';

  // Signal reactivo para listar los canales
  readonly channels = signal<INotificationChannel[]>([]);

  /**
   * Carga todos los canales de notificación configurados por el administrador
   */
  loadChannels(): Observable<INotificationChannel[]> {
    return this.http.get<INotificationChannel[]>(this.apiUrl).pipe(
      tap(data => this.channels.set(data))
    );
  }

  /**
   * Crea un nuevo canal de notificación
   */
  create(channel: Partial<INotificationChannel>): Observable<INotificationChannel> {
    return this.http.post<INotificationChannel>(this.apiUrl, channel).pipe(
      tap(created => this.channels.update(list => [...list, created]))
    );
  }

  /**
   * Actualiza la configuración de un canal existente
   */
  update(id: string, channel: Partial<INotificationChannel>): Observable<INotificationChannel> {
    return this.http.put<INotificationChannel>(`${this.apiUrl}/${id}`, channel).pipe(
      tap(updated => this.channels.update(list =>
        list.map(c => c.id === id ? updated : c)
      ))
    );
  }

  /**
   * Elimina un canal de notificación de la base de datos
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.channels.update(list => list.filter(c => c.id !== id)))
    );
  }

  /**
   * Dispara una alerta de prueba simulada a través de un canal para verificar su integración
   */
  testChannel(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/test`, {});
  }
}
