import { Injectable, inject, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { MonitorService } from './monitor.service';
import { FederationService } from './federation.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly monitorService = inject(MonitorService);
  private readonly federationService = inject(FederationService);
  private readonly toastService = inject(ToastService);

  // Instancia activa del socket; null si no hay conexión establecida
  private socket: Socket | null = null;

  private heartbeatCallbacks: ((hb: any) => void)[] = [];
  private reconnectCallbacks: (() => void)[] = [];
  // true entre un 'disconnect' y el siguiente 'connect' — distingue una reconexión real (donde se
  // pudieron perder heartbeats y hay que resincronizar el estado) del connect inicial al abrir la app.
  private wasDisconnected = false;

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
      transports: ['websocket', 'polling'],
      // Sin límite de intentos (default de socket.io-client): con un tope bajo, una caída
      // prolongada (ej. redeploy del backend) dejaba el dashboard congelado para siempre — sin
      // más heartbeats entrando, sin más reintentos, y sin ningún indicio visible del problema
      // hasta que alguien recargara la página a mano.
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[Realtime] Conectado al servidor de eventos:', this.socket?.id);
      if (this.wasDisconnected) {
        // Se perdieron heartbeats durante la caída — re-sincronizar el estado en vez de esperar
        // a que el próximo heartbeat "de paso" lo arregle.
        this.wasDisconnected = false;
        this.reconnectCallbacks.forEach((cb) => {
          try {
            cb();
          } catch (e) {
            console.error('[Realtime] Error en callback de reconexión:', e);
          }
        });
      }
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

    // Escucha la notificación en tiempo real cuando un par completa el enrolamiento
    this.socket.on('federation:enrolled', (data: { label?: string }) => {
      const label = data?.label ?? 'remota';
      this.toastService.show(`¡Instancia federada "${label}" lista y conectada!`);
      this.federationService.loadInstances().subscribe();
      this.federationService.loadLinks().subscribe();
      this.monitorService.loadMonitors().subscribe();
    });

    // Escucha cuando terminan de crearse/actualizarse monitores o vínculos federados en segundo
    // plano (auto-vinculación, o un par que registró su vínculo recíproco) — sin esto, el usuario
    // tiene que recargar la página (F5) para ver los monitores importados o el gráfico Multi-Nodo
    // recién aparecido (ver AZ-050). "federation:enrolled" no alcanza: se dispara al momento del
    // enrollment, antes de que la auto-vinculación (que corre después, en segundo plano) termine.
    this.socket.on('federation:links-updated', () => {
      this.federationService.loadInstances().subscribe();
      this.federationService.loadLinks().subscribe();
      this.monitorService.loadMonitors().subscribe();
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('[Realtime] Desconectado del servidor:', reason);
      this.wasDisconnected = true;
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
   * Registra un callback que se ejecuta al recuperar la conexión después de una caída real (no en
   * el connect inicial) — para resincronizar datos que pudieron perderse mientras estuvo desconectado.
   */
  onReconnect(callback: () => void): () => void {
    this.reconnectCallbacks.push(callback);
    return () => {
      this.reconnectCallbacks = this.reconnectCallbacks.filter(cb => cb !== callback);
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
    this.reconnectCallbacks = [];
    this.wasDisconnected = false;
  }

  /**
   * Limpieza automática al destruir el servicio (Angular lifecycle)
   */
  ngOnDestroy(): void {
    this.disconnect();
  }
}
