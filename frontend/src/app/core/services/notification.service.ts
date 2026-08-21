// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type AlertEventType = 'DOWN' | 'RECOVERED' | 'DEGRADED' | 'LATENCY_HIGH' | 'DEFACEMENT';

export const ALERT_EVENT_TYPES: AlertEventType[] = ['DOWN', 'RECOVERED', 'DEGRADED', 'LATENCY_HIGH', 'DEFACEMENT'];

export interface INotificationTemplate {
  subject?: string;
  body: string;
}

export interface INotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'telegram' | 'discord' | 'webhook';
  config: Record<string, any>;
  isActive: boolean;
  events: AlertEventType[] | 'all';
  templates: Partial<Record<AlertEventType, INotificationTemplate>>;
}

const DEFAULT_TITLES: Record<AlertEventType, string> = {
  DOWN: 'ALERTA DE CAÍDA (DOWN)',
  RECOVERED: 'ALERTA RESTABLECIDA (UP)',
  DEGRADED: 'ALERTA DE DEGRADACIÓN (RESPUESTA LENTA/ANÓMALA)',
  LATENCY_HIGH: 'ALERTA DE LATENCIA ALTA',
  DEFACEMENT: 'ALERTA DE DEFACEMENT',
};

const DEFAULT_BODY =
  '🚨 *{{status}}* 🚨\n\n*Monitor:* {{monitor}}\n*Objetivo:* {{url}}\n*Estado:* {{previousStatus}} ➡️ {{status}}\n*Detalle:* {{detail}}\n*Ping:* {{ping}} ms\n*Fecha/Hora:* {{datetime}}';

const DEFAULT_WEBHOOK_BODY = JSON.stringify({
  event: 'monitor.status_changed',
  monitor: { id: '{{monitorId}}', name: '{{monitor}}', type: '{{monitorType}}', target: '{{url}}' },
  transition: { from: '{{previousStatus}}', to: '{{status}}' },
  heartbeat: { timestamp: '{{datetime}}', ping: '{{ping}}', msg: '{{detail}}' },
});

/**
 * Espeja backend/src/infrastructure/notifier/default-templates.ts — misma plantilla que el
 * notifier usa como fallback en runtime si el canal no tiene una plantilla guardada para el
 * evento. Se usa acá para precargarla visiblemente en el formulario de edición (antes el campo
 * quedaba vacío y el admin no sabía que existía un mensaje por defecto que podía modificar).
 */
export function defaultTemplateFor(eventType: AlertEventType, channelType: INotificationChannel['type']): INotificationTemplate {
  if (channelType === 'webhook') {
    return { body: DEFAULT_WEBHOOK_BODY };
  }
  return { subject: DEFAULT_TITLES[eventType], body: DEFAULT_BODY };
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
  testChannel(id: string, eventType: AlertEventType = 'DOWN'): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/test`, { eventType });
  }
}
