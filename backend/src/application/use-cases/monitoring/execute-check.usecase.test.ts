// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { ExecuteCheckUseCase } from "./execute-check.usecase";
import { ICheckerRegistry, ICheckStrategy, CheckResult } from "../../ports/services/check-strategy";
import { IHeartbeatRepository, HeartbeatSummary } from "../../ports/repositories/heartbeat-repository";
import { IRealtimePublisher } from "../../ports/services/realtime-publisher";
import { INotifier, NotificationEvent } from "../../ports/services/notifier";
import { IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { IMonitoringEngineConfigResolver } from "../../ports/services/monitoring-engine-config-resolver";
import { IMaintenanceWindow } from "../../../domain/entities/maintenance-window";
import { IMonitor } from "../../../domain/entities/monitor";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";
import { NetworkDiagnostics } from "../../../infrastructure/services/network-diagnostics";

// `NetworkDiagnostics.checkIsLocalNetworkDown()` hace una resolución DNS real (ver
// infrastructure/services/network-diagnostics.ts) — en un entorno de test sin egress de DNS
// (sandbox/CI restringido) siempre reportaría "red local caída" y suprimiría las alertas que
// estos tests verifican, sin relación alguna con la lógica bajo prueba. Se precarga su caché
// interna (privada, de ahí el cast) para simular "red arriba" sin depender de conectividad real.
(NetworkDiagnostics as unknown as { lastCheckTime: number; cachedIsLocalDown: boolean }).lastCheckTime = Date.now();
(NetworkDiagnostics as unknown as { lastCheckTime: number; cachedIsLocalDown: boolean }).cachedIsLocalDown = false;

const DEGRADED_LATENCY_MS = 5000;
const ACCELERATED_INTERVAL_SECONDS = 15;

function makeConfigResolver(): IMonitoringEngineConfigResolver {
  return {
    resolve: async () => ({
      degradedLatencyMs: DEGRADED_LATENCY_MS,
      acceleratedIntervalSeconds: ACCELERATED_INTERVAL_SECONDS,
    }),
  };
}

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m1",
    userId: "admin-1",
    name: "Monitor de prueba",
    type: "http",
    target: "https://example.test",
    interval: 60,
    retries: 0,
    // Por debajo de ACCELERATED_INTERVAL_SECONDS (15) para que las pruebas de aceleración no
    // queden enmascaradas por el piso de retryInterval (ver test dedicado al piso más abajo).
    retryInterval: 10,
    group: null,
    tags: [],
    isActive: true,
    notificationIds: ["n1"],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRegistry(result: CheckResult): ICheckerRegistry {
  const strategy: ICheckStrategy = { type: "http", check: async () => result };
  return { resolve: () => strategy };
}

/** Como `makeRegistry`, pero devuelve un `CheckResult` distinto según el tipo pedido —
 * necesario para probar `runDegradationHeuristic`, que resuelve "ping"/"port" por separado
 * del checker HTTP principal del monitor. */
function makeTypedRegistry(results: Partial<Record<"http" | "ping" | "port", CheckResult>>): ICheckerRegistry {
  return {
    resolve: (type) => ({
      type,
      check: async () => results[type as "http" | "ping" | "port"] ?? { ok: false, ping: null, msg: "sin mock para este tipo" },
    }),
  };
}

function makeHeartbeats(): IHeartbeatRepository & { saved: IHeartbeat[] } {
  const saved: IHeartbeat[] = [];
  return {
    saved,
    save: async (beat) => {
      saved.push(beat);
    },
    findLast24h: async () => [],
    findHistory: async () => [],
    findHistoryForMonitors: async () => [],
    deleteByMonitor: async () => undefined,
    getSummaries: async () => ({} as Record<string, HeartbeatSummary>),
    findLastEventsForMonitors: async () => [],
  };
}

function makeRealtime(): IRealtimePublisher & { published: IHeartbeat[] } {
  const published: IHeartbeat[] = [];
  return {
    published,
    publishHeartbeat: (_userId, beat) => {
      published.push(beat);
    },
  };
}

function makeNotifier(): INotifier & { events: NotificationEvent[] } {
  const events: NotificationEvent[] = [];
  return {
    events,
    notify: async (event) => {
      events.push(event);
    },
  };
}

function makeMaintenanceRepo(activeWindows: IMaintenanceWindow[] = []): IMaintenanceRepository {
  return {
    create: async () => { throw new Error("not implemented"); },
    findAll: async () => [],
    findActive: async () => activeWindows,
    findById: async () => null,
    update: async () => null,
    close: async () => null,
    delete: async () => false,
  };
}

/** La heurística post-caída corre fire-and-forget (no la espera `execute()`) — como todos los
 * mocks del archivo resuelven de inmediato, unas pocas vueltas de `setImmediate` alcanzan para
 * que termine antes de las aserciones. */
function flushAsync(times = 5): Promise<void> {
  return new Promise((resolve) => {
    let count = 0;
    const tick = (): void => {
      count++;
      if (count >= times) resolve();
      else setImmediate(tick);
    };
    setImmediate(tick);
  });
}

function makeWindow(overrides: Partial<IMaintenanceWindow> = {}): IMaintenanceWindow {
  return {
    id: "w1",
    createdBy: "admin-1",
    name: "Migración programada",
    scope: [{ type: "all" }],
    mode: "immediate",
    startAt: null,
    endAt: null,
    closedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

test("sin mantenimiento activo: caída confirmada dispara notify DOWN normalmente", async () => {
  const heartbeats = makeHeartbeats();
  const realtime = makeRealtime();
  const notifier = makeNotifier();
  const useCase = new ExecuteCheckUseCase(
    makeRegistry({ ok: false, ping: null, msg: "timeout" }),
    heartbeats,
    realtime,
    notifier,
    makeMaintenanceRepo([]),
    makeConfigResolver(),
  );

  const outcome = await useCase.execute(makeMonitor(), { lastStatus: MonitorStatus.UP, retryAttempts: 0 });

  assert.equal(outcome.status, MonitorStatus.DOWN);
  assert.equal(heartbeats.saved.length, 1);
  assert.equal(heartbeats.saved[0].status, MonitorStatus.DOWN);
  assert.equal(notifier.events.length, 1);
  assert.equal(notifier.events[0].eventType, "DOWN");
  assert.equal(outcome.nextDelaySeconds, ACCELERATED_INTERVAL_SECONDS, "un DOWN confirmado acelera el polling");
});

test("con mantenimiento activo (alcance 'all'): no ejecuta el checker real ni notifica", async () => {
  const heartbeats = makeHeartbeats();
  const realtime = makeRealtime();
  const notifier = makeNotifier();
  let checkerCalled = false;
  const registry: ICheckerRegistry = {
    resolve: () => ({
      type: "http",
      check: async () => {
        checkerCalled = true;
        return { ok: false, ping: null, msg: "no debería llamarse" };
      },
    }),
  };

  const useCase = new ExecuteCheckUseCase(
    registry,
    heartbeats,
    realtime,
    notifier,
    makeMaintenanceRepo([makeWindow()]),
    makeConfigResolver(),
  );

  const outcome = await useCase.execute(makeMonitor(), { lastStatus: MonitorStatus.UP, retryAttempts: 0 });

  assert.equal(checkerCalled, false, "el checker real no debe ejecutarse durante mantenimiento");
  assert.equal(outcome.status, MonitorStatus.MAINTENANCE);
  assert.equal(heartbeats.saved.length, 1);
  assert.equal(heartbeats.saved[0].status, MonitorStatus.MAINTENANCE);
  assert.equal(realtime.published.length, 1);
  assert.equal(notifier.events.length, 0, "no debe dispararse ninguna alerta durante mantenimiento");
});

test("mantenimiento activo preserva lastStatus/retryAttempts para la transición posterior", async () => {
  const useCase = new ExecuteCheckUseCase(
    makeRegistry({ ok: false, ping: null, msg: "no debería llamarse" }),
    makeHeartbeats(),
    makeRealtime(),
    makeNotifier(),
    makeMaintenanceRepo([makeWindow()]),
    makeConfigResolver(),
  );

  const outcome = await useCase.execute(makeMonitor(), { lastStatus: MonitorStatus.DOWN, retryAttempts: 2 });

  assert.equal(outcome.lastStatus, MonitorStatus.DOWN);
  assert.equal(outcome.retryAttempts, 2);
  assert.equal(outcome.nextDelaySeconds, 60);
});

test("mantenimiento por alcance 'group' no afecta a un monitor de otro grupo", async () => {
  const heartbeats = makeHeartbeats();
  const notifier = makeNotifier();
  const useCase = new ExecuteCheckUseCase(
    makeRegistry({ ok: false, ping: null, msg: "timeout" }),
    heartbeats,
    makeRealtime(),
    notifier,
    makeMaintenanceRepo([makeWindow({ scope: [{ type: "group", value: "otro-grupo" }] })]),
    makeConfigResolver(),
  );

  const outcome = await useCase.execute(
    makeMonitor({ group: "grupo-a" }),
    { lastStatus: MonitorStatus.UP, retryAttempts: 0 },
  );

  assert.equal(outcome.status, MonitorStatus.DOWN);
  assert.equal(notifier.events.length, 1);
});

test("HTTP con latencia bajo el umbral: UP normal, intervalo estándar", async () => {
  const heartbeats = makeHeartbeats();
  const notifier = makeNotifier();
  const useCase = new ExecuteCheckUseCase(
    makeRegistry({ ok: true, ping: DEGRADED_LATENCY_MS - 1, msg: "200 OK" }),
    heartbeats,
    makeRealtime(),
    notifier,
    makeMaintenanceRepo([]),
    makeConfigResolver(),
  );

  const outcome = await useCase.execute(makeMonitor(), { lastStatus: MonitorStatus.UP, retryAttempts: 0 });

  assert.equal(outcome.status, MonitorStatus.UP);
  assert.equal(outcome.nextDelaySeconds, 60, "bajo el umbral, usa el intervalo configurado del monitor");
  assert.equal(heartbeats.saved[0].status, MonitorStatus.UP);
  assert.equal(notifier.events.length, 0, "sin transición real (UP -> UP), no debe alertar");
});

test("HTTP con latencia sobre el umbral: DEGRADADO directo, sin pasar por PENDING", async () => {
  const heartbeats = makeHeartbeats();
  const notifier = makeNotifier();
  const useCase = new ExecuteCheckUseCase(
    makeRegistry({ ok: true, ping: DEGRADED_LATENCY_MS + 1, msg: "200 OK" }),
    heartbeats,
    makeRealtime(),
    notifier,
    makeMaintenanceRepo([]),
    makeConfigResolver(),
  );

  const outcome = await useCase.execute(makeMonitor(), { lastStatus: MonitorStatus.UP, retryAttempts: 0 });

  assert.equal(outcome.status, MonitorStatus.DEGRADED);
  assert.equal(outcome.retryAttempts, 0, "no pasa por la máquina de reintentos, es una transición directa");
  assert.equal(outcome.nextDelaySeconds, ACCELERATED_INTERVAL_SECONDS);
  assert.equal(heartbeats.saved[0].status, MonitorStatus.DEGRADED);
  assert.match(heartbeats.saved[0].msg ?? "", /Latencia alta/);
  assert.equal(notifier.events.length, 1);
  assert.equal(notifier.events[0].eventType, "DEGRADED");
  assert.equal(notifier.events[0].to, MonitorStatus.DEGRADED);
});

test("UP tras DOWN/DEGRADADO restaura el intervalo normal configurado", async () => {
  const useCase = new ExecuteCheckUseCase(
    makeRegistry({ ok: true, ping: 20, msg: "200 OK" }),
    makeHeartbeats(),
    makeRealtime(),
    makeNotifier(),
    makeMaintenanceRepo([]),
    makeConfigResolver(),
  );

  const outcome = await useCase.execute(
    makeMonitor({ interval: 60 }),
    { lastStatus: MonitorStatus.DEGRADED, retryAttempts: 0 },
  );

  assert.equal(outcome.status, MonitorStatus.UP);
  assert.equal(outcome.nextDelaySeconds, 60, "al recuperarse, vuelve al intervalo normal del monitor");
});

test("un monitor que sigue DOWN en checks consecutivos (polling acelerado) no repite la alerta", async () => {
  const heartbeats = makeHeartbeats();
  const notifier = makeNotifier();
  const useCase = new ExecuteCheckUseCase(
    makeRegistry({ ok: false, ping: null, msg: "timeout" }),
    heartbeats,
    makeRealtime(),
    notifier,
    makeMaintenanceRepo([]),
    makeConfigResolver(),
  );

  // Simula el scheduler: primer beat confirma el DOWN (dispara 1 alerta), y varios beats
  // subsiguientes al intervalo acelerado (15s) mientras el monitor sigue caído — igual que
  // in-memory-scheduler.ts encadena `outcome.lastStatus` de una llamada a la siguiente.
  let ctx = { lastStatus: MonitorStatus.UP, retryAttempts: 0 };
  const first = await useCase.execute(makeMonitor(), ctx);
  ctx = { lastStatus: first.lastStatus!, retryAttempts: first.retryAttempts };

  for (let i = 0; i < 5; i++) {
    const outcome = await useCase.execute(makeMonitor(), ctx);
    ctx = { lastStatus: outcome.lastStatus!, retryAttempts: outcome.retryAttempts };
  }

  assert.equal(heartbeats.saved.length, 6, "cada beat sigue guardando su heartbeat (para el historial)");
  assert.equal(notifier.events.length, 1, "solo la primera transición a DOWN debe alertar, no cada beat");
  assert.equal(notifier.events[0].eventType, "DOWN");
});

test("un monitor que sigue DEGRADADO (latencia alta) en checks consecutivos no repite la alerta", async () => {
  const notifier = makeNotifier();
  const useCase = new ExecuteCheckUseCase(
    makeRegistry({ ok: true, ping: DEGRADED_LATENCY_MS + 1, msg: "200 OK" }),
    makeHeartbeats(),
    makeRealtime(),
    notifier,
    makeMaintenanceRepo([]),
    makeConfigResolver(),
  );

  let ctx = { lastStatus: MonitorStatus.UP, retryAttempts: 0 };
  for (let i = 0; i < 4; i++) {
    const outcome = await useCase.execute(makeMonitor(), ctx);
    ctx = { lastStatus: outcome.lastStatus!, retryAttempts: outcome.retryAttempts };
  }

  assert.equal(notifier.events.length, 1, "solo la primera transición a DEGRADADO debe alertar");
  assert.equal(notifier.events[0].eventType, "DEGRADED");
});

test("el intervalo acelerado nunca es más rápido que el retryInterval del propio monitor", async () => {
  // retryInterval (30s) > ACCELERATED_INTERVAL_SECONDS (15s): el piso debe ganar, para no
  // revisar más seguido una vez confirmado DOWN que durante la fase de reintentos.
  const useCase = new ExecuteCheckUseCase(
    makeRegistry({ ok: false, ping: null, msg: "timeout" }),
    makeHeartbeats(),
    makeRealtime(),
    makeNotifier(),
    makeMaintenanceRepo([]),
    makeConfigResolver(),
  );

  const outcome = await useCase.execute(
    makeMonitor({ retryInterval: 30 }),
    { lastStatus: MonitorStatus.UP, retryAttempts: 0 },
  );

  assert.equal(outcome.status, MonitorStatus.DOWN);
  assert.equal(outcome.nextDelaySeconds, 30, "el retryInterval (30s) del monitor gana sobre el acelerado global (15s)");
});

test("heurística post-caída: al concluir DEGRADADO, el heartbeat lleva el ping real medido (no null)", async () => {
  const heartbeats = makeHeartbeats();
  const notifier = makeNotifier();
  const registry = makeTypedRegistry({
    http: { ok: false, ping: null, msg: "timeout" },
    // El puerto TCP exacto de la app SÍ acepta conexión (handshake ok) pero la petición HTTP
    // igual falla — esa es la única señal real de "app viva pero degradada/sobrecargada".
    port: { ok: true, ping: 42, msg: "connected" },
  });
  const useCase = new ExecuteCheckUseCase(
    registry,
    heartbeats,
    makeRealtime(),
    notifier,
    makeMaintenanceRepo([]),
    makeConfigResolver(),
  );

  await useCase.execute(makeMonitor(), { lastStatus: MonitorStatus.UP, retryAttempts: 0 });
  await flushAsync();

  assert.equal(heartbeats.saved.length, 2, "el heartbeat DOWN inicial + el DEGRADADO de la heurística");
  const degradedBeat = heartbeats.saved[1];
  assert.equal(degradedBeat.status, MonitorStatus.DEGRADED);
  assert.equal(degradedBeat.ping, 42, "debe llevar el ping real medido por el checker de puerto, no null");
  assert.equal(notifier.events.length, 2, "aviso DOWN inicial + aviso DEGRADADO de la heurística");
  assert.equal(notifier.events[1].eventType, "DEGRADED");
  assert.equal(notifier.events[1].beat.ping, 42);
});

test("heurística post-caída: si el puerto TCP exacto rechaza la conexión, el veredicto queda en DOWN aunque el host responda ping", async () => {
  // Caso real reportado: el host tiene otros servicios y responde ping igual, pero el puerto de
  // la app monitoreada está completamente cerrado (ECONNREFUSED) — eso es una caída real, no
  // "degradación". El ping ICMP ya no participa en absoluto de esta decisión.
  const heartbeats = makeHeartbeats();
  const notifier = makeNotifier();
  const registry = makeTypedRegistry({
    http: { ok: false, ping: null, msg: "timeout" },
    ping: { ok: true, ping: 1, msg: "alive (1 ms)" },
    port: { ok: false, ping: null, msg: "ECONNREFUSED" },
  });
  const useCase = new ExecuteCheckUseCase(
    registry,
    heartbeats,
    makeRealtime(),
    notifier,
    makeMaintenanceRepo([]),
    makeConfigResolver(),
  );

  await useCase.execute(makeMonitor(), { lastStatus: MonitorStatus.UP, retryAttempts: 0 });
  await flushAsync();

  assert.equal(heartbeats.saved.length, 1, "solo el heartbeat DOWN inicial — la heurística no debe agregar un DEGRADADO");
  assert.equal(heartbeats.saved[0].status, MonitorStatus.DOWN);
  assert.equal(notifier.events.length, 1, "solo el aviso DOWN inicial");
  assert.equal(notifier.events[0].eventType, "DOWN");
});
