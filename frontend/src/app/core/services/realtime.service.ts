import { Injectable, inject, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { MonitorService, IHeartbeat } from './monitor.service';

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly monitorService = inject(MonitorService);

  // Instancia activa del socket; null si no hay conexión establecida
  private socket: Socket | null = null;

  private heartbeatCallbacks: ((hb: any) => void)[] = [];

  /**
   * Establece la conexión con el servidor de Socket.io.
   * Autentica el handshake enviando el token JWT en la query.
   * El backend unirá al cliente a la room del admin propietario.
   */
  connect(): void {
    if (this.socket?.connected) return;

    const token = this.authService.getAccessToken();

    this.socket = io('/', {
      path: '/socket.io',
      auth: { token: token ?? '' },
      query: { token: token ?? '' },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[Realtime] Conectado al servidor de eventos:', this.socket?.id);
    });

    // Escucha el evento heartbeat y actualiza de forma reactiva el Signal de monitores
    this.socket.on('heartbeat', (heartbeat: any) => {
      this.monitorService.applyHeartbeat(heartbeat);
      // Disparar callbacks registrados
      this.heartbeatCallbacks.forEach(cb => {
        try {
          cb(heartbeat);
        } catch (e) {
          console.error('[Realtime] Error en callback de heartbeat:', e);
        }
      });
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('[Realtime] Desconectado del servidor:', reason);
    });

    this.socket.on('connect_error', (err: Error) => {
      console.error('[Realtime] Error de conexión:', err.message);
    });
  }

  /**
   * Registra un callback que se ejecuta al recibir un heartbeat. Retorna una función para cancelar la suscripción.
   */
  onHeartbeat(callback: (hb: any) => void): () => void {
    this.heartbeatCallbacks.push(callback);
    return () => {
      this.heartbeatCallbacks = this.heartbeatCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Desconecta el socket activo de forma limpia
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.heartbeatCallbacks = [];
  }

  /**
   * Limpieza automática al destruir el servicio (Angular lifecycle)
   */
  ngOnDestroy(): void {
    this.disconnect();
  }
}
