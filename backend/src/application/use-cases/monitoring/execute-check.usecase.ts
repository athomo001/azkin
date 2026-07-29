// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { ICheckerRegistry } from "../../ports/services/check-strategy";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IRealtimePublisher } from "../../ports/services/realtime-publisher";
import { INotifier } from "../../ports/services/notifier";
import { IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { findActiveMaintenanceForMonitor } from "../../services/maintenance-scope-policy";
import { IMonitoringEngineConfigResolver } from "../../ports/services/monitoring-engine-config-resolver";
import { AlertEventType } from "../../../domain/value-objects/alert-event-type";
import { IMonitor } from "../../../domain/entities/monitor";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";
import { NetworkDiagnostics } from "../../../infrastructure/services/network-diagnostics";
import { logger } from "../../../infrastructure/logger";

/** Estado runtime que aporta el scheduler para decidir reintentos/transiciones. */
export interface CheckContext {
  lastStatus: MonitorStatus | null;
  retryAttempts: number;
  // Timestamps (epoch ms) de transiciones UP/DOWN/DEGRADADO confirmadas recientes — ver
  // guarda anti-flapping en `execute()`. `undefined` en el primer beat de un monitor recién
  // agendado (equivale a "sin historial", igual que `lastStatus: null`).
  recentTransitionTimestamps?: number[];
  // Último estado sobre el que sí se envió una notificación (puede quedar rezagado de
  // `lastStatus` mientras el monitor está "flapping" y las alertas se suprimen).
  lastNotifiedStatus?: MonitorStatus | null;
}

export interface CheckOutcome {
  status: MonitorStatus;
  lastStatus: MonitorStatus | null;
  retryAttempts: number;
  nextDelaySeconds: number;
  recentTransitionTimestamps: number[];
  lastNotifiedStatus: MonitorStatus | null;
}

/**
 * Ejecuta un beat: check → persiste → publica → alerta en transición confirmada.
 * La máquina de reintentos vive aquí; el scheduler solo conserva el estado runtime.
 */
export class ExecuteCheckUseCase {
  constructor(
    private readonly registry: ICheckerRegistry,
    private readonly heartbeats: IHeartbeatRepository,
    private readonly realtime: IRealtimePublisher,
    private readonly notifier: INotifier,
    private readonly maintenance: IMaintenanceRepository,
    // Fuente de `degradedLatencyMs`/`acceleratedIntervalSeconds` y de la guarda anti-flapping
    // (`flapThreshold`/`flapWindowSeconds`, AZ-071): sitios detrás de un CDN/WAF (Cloudflare,
    // Vercel) pueden oscilar UP/DEGRADADO/DOWN varias veces en pocos minutos por ruido del borde
    // (revalidación de challenge, cold start de función serverless, ruteo a otro POP) sin que el
    // origen real haya dejado de funcionar. Más de `flapThreshold` transiciones confirmadas
    // dentro de `flapWindowSeconds` suprime nuevas alertas (el heartbeat SIGUE guardándose y
    // publicándose en tiempo real — solo se calla el correo/Slack/etc.) hasta que el monitor deja
    // de oscilar por una ventana completa; en ese momento se envía UNA alerta de "estado actual"
    // para que el usuario quede al tanto del veredicto final, en vez de perderse la resolución.
    // Configurable en caliente desde /settings → Sistema (mismo patrón que los otros dos campos).
    private readonly monitoringConfig: IMonitoringEngineConfigResolver,
  ) {}

  async execute(monitor: IMonitor, ctx: CheckContext): Promise<CheckOutcome> {
    const activeMaintenance = findActiveMaintenanceForMonitor(monitor, await this.maintenance.findActive());
    if (activeMaintenance) {
      return this.recordMaintenanceBeat(monitor, ctx, activeMaintenance.name);
    }

    const { degradedLatencyMs, acceleratedIntervalSeconds, flapThreshold, flapWindowSeconds } =
      await this.monitoringConfig.resolve();
    // El acelerado nunca es más rápido que el propio retryInterval del monitor: si un admin
    // configuró reintentos cada 30s para confirmar una caída, no tiene sentido que, una vez
    // confirmada, Azkin la revise más seguido (cada 15s) que durante la fase de verificación.
    const effectiveAcceleratedSeconds = Math.max(acceleratedIntervalSeconds, monitor.retryInterval);

    const result = await this.registry.resolve(monitor.type).check(monitor);

    let status: MonitorStatus;
    let retryAttempts = ctx.retryAttempts;
    let nextDelaySeconds: number;
    let isLocalNetworkDown = false;
    let beatMsg = result.msg;

    if (result.ok) {
      retryAttempts = 0;
      // Un HTTP que responde OK pero muy lento se trata como degradado, no como UP —
      // sin esperar a que la petición muera por timeout completo.
      const isSlowHttp = monitor.type === "http" && result.ping !== null && result.ping > degradedLatencyMs;
      if (isSlowHttp) {
        status = MonitorStatus.DEGRADED;
        nextDelaySeconds = effectiveAcceleratedSeconds;
        beatMsg = `Latencia alta: ${result.ping}ms (umbral ${degradedLatencyMs}ms)`;
      } else {
        status = MonitorStatus.UP;
        nextDelaySeconds = monitor.interval;
      }
    } else {
      // Si el chequeo falla, verificar si es debido a la falta de conexión local a Internet
      isLocalNetworkDown = await NetworkDiagnostics.checkIsLocalNetworkDown();

      if (retryAttempts < monitor.retries) {
        retryAttempts += 1;
        status = MonitorStatus.PENDING;
        nextDelaySeconds = monitor.retryInterval;
      } else {
        status = MonitorStatus.DOWN;
        retryAttempts = 0;
        // Polling adaptativo: mientras el monitor no esté UP, se chequea más seguido para
        // registrar la curva de recuperación sin esperar el intervalo normal configurado.
        nextDelaySeconds = effectiveAcceleratedSeconds;
      }
    }

    const beat: IHeartbeat = {
      monitorId: monitor.id,
      timestamp: new Date(),
      status,
      ping: result.ping,
      msg: isLocalNetworkDown ? "Error de conexión local (ISP Outage)" : beatMsg,
      certExpiry: (result as any).certExpiry,
      domainExpiry: (result as any).domainExpiry,
      isLocalNetworkDown,
    };

    await this.heartbeats.save(beat);
    this.realtime.publishHeartbeat(monitor.userId, beat);

    // Alerta solo en transición confirmada UP/DOWN/DEGRADED (PENDING no dispara).
    const prevStatus = ctx.lastStatus;
    let lastStatus = prevStatus;
    let recentTransitionTimestamps = ctx.recentTransitionTimestamps ? [...ctx.recentTransitionTimestamps] : [];
    // `undefined` (campo ausente en el ctx, ej. llamador que no rastrea esta guarda) se trata
    // como "sin deuda de notificación pendiente" → equivale a `prevStatus`, NO a `null`. `null`
    // explícito sí es un valor válido y distinto: significa "hubo flapping suprimido y todavía
    // no se notificó el estado ya confirmado en `prevStatus`".
    let lastNotifiedStatus = ctx.lastNotifiedStatus !== undefined ? ctx.lastNotifiedStatus : prevStatus;

    if (status === MonitorStatus.UP || status === MonitorStatus.DOWN || status === MonitorStatus.DEGRADED) {
      if (prevStatus !== null) {
        const isTransition = prevStatus !== status;
        const now = Date.now();
        const flapWindowMs = flapWindowSeconds * 1000;

        if (isTransition && !isLocalNetworkDown) {
          recentTransitionTimestamps.push(now);
        }
        // Poda por ventana en CADA beat (no solo en los que transicionan): así, si el monitor
        // deja de oscilar, las transiciones viejas van "caducando" solas y `isFlapping` se
        // apaga sin depender de una transición nueva — eso es lo que dispara la alerta de
        // "estado actual" de abajo cuando el ruido finalmente cesa.
        recentTransitionTimestamps = recentTransitionTimestamps.filter((t) => now - t <= flapWindowMs);
        const isFlapping = recentTransitionTimestamps.length > flapThreshold;

        if (isLocalNetworkDown) {
          // Si el fallo es por una caída confirmada de la red local, evitamos enviar alertas
          // para no generar falsos positivos spameando al usuario.
          if (isTransition) {
            logger.warn(
              `[Diagnóstico de Red] Alerta omitida para monitor ${monitor.name} debido a ISP Outage local.`
            );
          }
        } else if (isFlapping) {
          if (isTransition) {
            logger.warn(
              `[Anti-flapping] Monitor ${monitor.name} osciló ${recentTransitionTimestamps.length} veces en ` +
              `${flapWindowSeconds}s — alerta suprimida hasta que se estabilice (umbral: ${flapThreshold}).`,
            );
          }
        } else if (lastNotifiedStatus !== status) {
          // Cubre tanto la transición "normal" (se dispara en el mismo beat) como la alerta de
          // "estado actual" tras un período de flapping ya calmado (se dispara en un beat sin
          // transición, una vez que `isFlapping` vuelve a false). `?? prevStatus`: solo satisface
          // al type-checker (prevStatus está narrowed no-nulo en este bloque) — por invariante
          // `lastNotifiedStatus` ya no debería ser `null` aquí una vez que el monitor tuvo un
          // primer estado confirmado (ver rama `else` de abajo).
          const eventType: AlertEventType =
            status === MonitorStatus.DOWN ? "DOWN" : status === MonitorStatus.DEGRADED ? "DEGRADED" : "RECOVERED";
          for (const notifId of monitor.notificationIds) {
            await this.notifier.notify({
              notificationId: notifId,
              eventType,
              monitor,
              from: lastNotifiedStatus ?? prevStatus,
              to: status,
              beat,
            });
          }
          lastNotifiedStatus = status;

          // Heurística post-caída (fire-and-forget, solo HTTP): un DOWN confirmado puede en
          // realidad ser un servidor vivo a nivel de red cuya app dejó de responder. No se
          // espera ni bloquea el aviso DOWN ya emitido arriba.
          if (status === MonitorStatus.DOWN && monitor.type === "http") {
            void this.runDegradationHeuristic(monitor).catch((err) =>
              logger.error(`Error en heurística de degradación para monitor ${monitor.name}: ${err}`),
            );
          }
        }
      } else {
        // Primer beat con historial (recién agendado/reiniciado el servidor): no hay nada que
        // notificar todavía, así que tampoco hay "deuda" de notificación pendiente sobre este
        // estado inicial — evita que el próximo beat calmado se confunda con un settle real.
        lastNotifiedStatus = status;
      }
      lastStatus = status;
    }

    return { status, lastStatus, retryAttempts, nextDelaySeconds, recentTransitionTimestamps, lastNotifiedStatus };
  }

  /**
   * Diagnóstico posterior a un DOWN confirmado (solo monitores HTTP): reintenta a nivel de
   * red/TCP el mismo host para distinguir "servidor realmente caído" de "servidor vivo pero la
   * aplicación no responde" (degradación/sobrecarga). Fire-and-forget: no toca
   * `ctx.lastStatus`/`retryAttempts`/`nextDelaySeconds` — la aceleración de polling ya aplicó vía
   * la rama DOWN de `execute()`, independiente de esta heurística asíncrona.
   */
  private async runDegradationHeuristic(monitor: IMonitor): Promise<void> {
    let hostname: string;
    let port: number;
    try {
      const url = new URL(monitor.target);
      hostname = url.hostname;
      port = url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80;
    } catch {
      return;
    }

    // Deliberadamente NO se usa ping ICMP como evidencia de degradación: el ping va al host, no
    // al puerto/app monitoreado, y un host con más de un servicio puede responder ping aunque la
    // app monitoreada esté completamente caída (falso "degradado" reportado en producción — el
    // puerto rechazaba la conexión por completo y aun así se avisó DEGRADED en vez de DOWN).
    // Solo un handshake TCP exitoso contra el puerto exacto de la app es evidencia real de
    // "servidor vivo pero aplicación no responde"; si el puerto rechaza la conexión, es una
    // caída real y el DOWN ya emitido queda como veredicto final.
    const portResult = await this.registry.resolve("port").check({ ...monitor, target: hostname, port });
    if (!portResult.ok) return;

    const beat: IHeartbeat = {
      monitorId: monitor.id,
      timestamp: new Date(),
      status: MonitorStatus.DEGRADED,
      // Latencia real del handshake TCP, no la del heartbeat DOWN original (ese venía de un
      // chequeo HTTP fallido, con `ping: null` siempre).
      ping: portResult.ping,
      msg: "El puerto TCP de la aplicación responde pero la petición HTTP no — posible degradación/sobrecarga.",
      isLocalNetworkDown: false,
    };

    await this.heartbeats.save(beat);
    this.realtime.publishHeartbeat(monitor.userId, beat);

    for (const notifId of monitor.notificationIds) {
      await this.notifier.notify({
        notificationId: notifId,
        eventType: "DEGRADED",
        monitor,
        from: MonitorStatus.DOWN,
        to: MonitorStatus.DEGRADED,
        beat,
      });
    }
  }

  /**
   * Registra un beat de mantenimiento sin ejecutar el checker real ni alertar (AZ-040): el
   * silenciado es implícito porque MAINTENANCE nunca entra al bloque de transición UP/DOWN de
   * arriba. `ctx.lastStatus`/`retryAttempts` se preservan intactos para que, al terminar la
   * ventana, la próxima transición real se compare contra el último estado UP/DOWN confirmado
   * (no contra MAINTENANCE).
   */
  private async recordMaintenanceBeat(
    monitor: IMonitor,
    ctx: CheckContext,
    windowName: string,
  ): Promise<CheckOutcome> {
    const beat: IHeartbeat = {
      monitorId: monitor.id,
      timestamp: new Date(),
      status: MonitorStatus.MAINTENANCE,
      ping: null,
      msg: `En mantenimiento: ${windowName}`,
      isLocalNetworkDown: false,
    };

    await this.heartbeats.save(beat);
    this.realtime.publishHeartbeat(monitor.userId, beat);

    return {
      status: MonitorStatus.MAINTENANCE,
      lastStatus: ctx.lastStatus,
      retryAttempts: ctx.retryAttempts,
      nextDelaySeconds: monitor.interval,
      recentTransitionTimestamps: ctx.recentTransitionTimestamps ?? [],
      lastNotifiedStatus: ctx.lastNotifiedStatus !== undefined ? ctx.lastNotifiedStatus : ctx.lastStatus,
    };
  }
}
