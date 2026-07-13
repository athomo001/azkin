# Fase 5 — El Motor de Monitoreo (Backend Core): Azkin

> Estado: **Aprobada** · Metodología: Spec-Driven Development (SDD)
> Deriva de [`01-general.md`](01-general.md) (Fase 5) sobre la arquitectura de
> [`02-arquitectura.md`](02-arquitectura.md), el modelo de [`03-modelo-datos.md`](03-modelo-datos.md)
> y los contratos de [`04-contratos-api.md`](04-contratos-api.md).

Especifica el núcleo que ejecuta los checks: orquestador de agendamiento, control de concurrencia,
flujo del beat con reintentos y emisión en tiempo real. Aún es **spec, no implementación cableada**.

> **Enmienda retropropagada:** la decisión de soportar reintentos añadió `retries` y `retryInterval`
> al modelo (F2) y a los DTOs (F3). Ya reflejado en ambos documentos.

---

## 1. Corrección justificada: `setTimeout` recursivo (no `setInterval`)

El `01-general.md` menciona `setInterval`. **Azkin usa `setTimeout` recursivo** (patrón `safeBeat`),
como ya se fijó en la Fase 1. Es exactamente la lección del análisis de Uptime Kuma:

- `setInterval` dispara a intervalo fijo **aunque el check anterior no haya terminado** → checks
  solapados, acumulación de trabajo, posible saturación.
- `setTimeout` recursivo agenda el siguiente beat **solo cuando el actual termina** → como mucho
  **1 check en vuelo por monitor**, sin solapamiento.

---

## 2. Componentes (sobre los puertos de F1)

| Componente | Capa | Rol |
|---|---|---|
| `InMemoryScheduler` (impl. de `IScheduler`) | infraestructura | Mantiene `Map<monitorId, ScheduledMonitor>` y los timers |
| `ExecuteCheckUseCase` | aplicación | Orquesta un beat: check → persistir → publicar → alertar |
| `CheckerRegistry` + `ICheckStrategy` | infra / puerto | Resuelve el checker por `type` (`http`/`ping`/`port`) |
| `IHeartbeatRepository` | puerto | Persiste el heartbeat en la time-series |
| `IRealtimePublisher` | puerto | Emite el heartbeat a `io.to(userId)` |
| `INotifier` | puerto (*seam*) | Hook de alerta en transición confirmada (no-op/log en esta fase) |
| Limitador `pLimit(N)` | infraestructura | Cerrojo de concurrencia global compartido |

### 2.1 Contrato del checker (puerto)

```ts
// application/ports/services/check-strategy.ts
export interface CheckResult {
  ok: boolean;         // true si el objetivo respondió correctamente
  ping: number | null; // latencia en ms (null si no medible)
  msg: string | null;  // "200 - OK", "timeout", "ECONNREFUSED", ...
}

export interface ICheckStrategy {
  readonly type: MonitorType;
  check(monitor: IMonitor): Promise<CheckResult>;
}
```

Añadir un tipo nuevo = una clase nueva registrada en el `CheckerRegistry`. **Cero modificación**
del motor (Open/Closed) — corrige el God Object de Uptime Kuma.

---

## 3. Estado en memoria del monitor agendado

```ts
interface ScheduledMonitor {
  monitor: IMonitor;
  timeout: NodeJS.Timeout | null;
  lastStatus: MonitorStatus | null; // último estado CONFIRMADO (UP/DOWN); null al arrancar
  retryAttempts: number;            // reintentos consumidos en el fallo en curso
  isStopped: boolean;               // corta el bucle recursivo de forma segura
}
```

- `lastStatus` vive en memoria → detección de transición sin leer la BD en cada beat.
- `retryAttempts` NO se persiste; es estado efímero del ciclo de fallo.
- Tras un reinicio del servidor, `lastStatus` es `null` y se re-evalúa desde el primer beat
  (comportamiento aceptable).

---

## 4. Concurrencia y backpressure

```ts
// infraestructura/config — configurable por entorno
const N = Number(process.env.AZKIN_CHECK_CONCURRENCY ?? 50);
const limit = pLimit(N); // única instancia COMPARTIDA por todo el motor
```

- El timer decide *cuándo* toca un beat; la **ejecución de red** siempre pasa por `limit(...)`.
- Como el próximo beat se agenda al terminar el actual, hay **≤ 1 check en vuelo por monitor** y el
  total simultáneo queda acotado por `N`. No hay colas que crezcan sin control.

---

## 5. Flujo del beat (con máquina de reintentos)

```
safeBeat(sm):                        # envuelve beat en try/catch → nunca rompe el bucle
  try: await beat(sm)
  catch e: log.error(e)
  finally: if !sm.isStopped: reagendar(sm, nextDelay)

beat(sm):
  result = await limit(() => registry.resolve(sm.monitor.type).check(sm.monitor))

  if result.ok:
      status = UP
      sm.retryAttempts = 0
      nextDelay = sm.monitor.interval
  else:
      if sm.retryAttempts < sm.monitor.retries:
          sm.retryAttempts += 1
          status = PENDING
          nextDelay = sm.monitor.retryInterval    # re-check más rápido durante el fallo
      else:
          status = DOWN
          sm.retryAttempts = 0
          nextDelay = sm.monitor.interval

  beatDoc = { monitorId, timestamp: now(), status, ping: result.ping, msg: result.msg }
  await heartbeatRepo.save(beatDoc)                          # (1) persistir
  realtime.publishHeartbeat(sm.monitor.userId, beatDoc)      # (2) emitir a la room del dueño

  # (3) detección de transición SOLO sobre estados confirmados (PENDING no alerta)
  if status in {UP, DOWN}:
      if sm.lastStatus !== null and sm.lastStatus !== status:
          notifier.notify({ monitor: sm.monitor, from: sm.lastStatus, to: status, beat: beatDoc })
      sm.lastStatus = status
```

**Máquina de estados del check:**

```
          fallo (quedan reintentos)
   ┌───────────────────────────────┐
   ▼                               │
 PENDING ──fallo (reintentos agotados)──▶ DOWN ──éxito──▶ UP
   │                                       ▲              │
   └──────────── éxito ───────────────────┘              │
                     ▲──────────── fallo (0 reintentos)───┘
```

- Solo las transiciones **UP↔DOWN confirmadas** disparan `INotifier` → evita alertas por fallos
  puntuales de red (razón de ser de los reintentos).
- Cada intento (incluido `PENDING`) **sí** se persiste y emite → el historial y el dashboard
  reflejan lo que ocurre en vivo.

---

## 6. Ciclo de vida del motor

```
start():                                   # tras database ready (bootstrap)
  actives = await monitorRepo.findAllActive()   # contexto SISTEMA: todos los usuarios
  for m in actives: schedule(m)

schedule(monitor):
  if map.has(monitor.id): unschedule(monitor.id)
  sm = { monitor, timeout: null, lastStatus: null, retryAttempts: 0, isStopped: false }
  map.set(monitor.id, sm)
  sm.timeout = setTimeout(() => safeBeat(sm), FIRST_CHECK_DELAY_MS)  # primer check casi inmediato

reschedule(monitor):                       # al editar (interval/target/isActive/…)
  prev = map.get(monitor.id)
  unschedule(monitor.id)
  schedule(monitor)
  if prev: sm.lastStatus = prev.lastStatus  # preserva estado → no re-alerta por editar config

unschedule(monitorId):
  sm = map.get(monitorId)
  if sm: sm.isStopped = true; clearTimeout(sm.timeout); map.delete(monitorId)

stopAll():                                 # apagado ordenado (SIGINT/SIGTERM)
  for sm in map.values(): sm.isStopped = true; clearTimeout(sm.timeout)
  map.clear()
```

**Integración con los casos de uso de la API (F3):**

| Caso de uso | Acción sobre el scheduler |
|---|---|
| `CreateMonitorUseCase` | `schedule(monitor)` si `isActive` |
| `UpdateMonitorUseCase` | `reschedule(monitor)` si `isActive`, si no `unschedule(id)` |
| `DeleteMonitorUseCase` | `unschedule(id)` y luego borrado en cascada de heartbeats |

---

## 7. Aislamiento multiusuario

El motor es el **único** punto que opera en contexto de sistema (agenda monitores de todos los
usuarios). El aislamiento se preserva en el **momento de emitir**: cada heartbeat sale únicamente a
`io.to(monitor.userId)`. Un usuario jamás recibe latidos de monitores ajenos.

---

## 8. Configuración (variables de entorno)

| Variable | Default | Uso |
|---|---|---|
| `AZKIN_CHECK_CONCURRENCY` | `50` | Tamaño del `pLimit` global |
| `AZKIN_FIRST_CHECK_DELAY_MS` | `1000` | Retardo del primer check tras agendar |

---

## 9. Trazabilidad de fases (SDD)

| Fase | Entregable | Estado |
|---|---|---|
| 1 — Arquitectura y stack | [`02-arquitectura.md`](02-arquitectura.md) | ✅ Aprobada |
| 2 — Modelado de datos | [`03-modelo-datos.md`](03-modelo-datos.md) | ✅ Aprobada (+ `retries`/`retryInterval`) |
| 3 — Contratos de API REST | [`04-contratos-api.md`](04-contratos-api.md) | ✅ Aprobada (+ `retries`/`retryInterval`) |
| 4 — UI/UX y frontend | Diferida por decisión del usuario | ⏸️ Aparcada |
| 5 — Motor de monitoreo | Este documento | ✅ Aprobada |
