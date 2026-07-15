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
como ya se fijó en la Fase 1. Es exactamente la lección del análisis de arquitecturas de referencia:

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
| `CheckerRegistry` + `ICheckStrategy` | infra / puerto | Resuelve el checker por `type` (`http`/`ping`/`port`/`dns`/`push`) |
| `IHeartbeatRepository` | puerto | Persiste el heartbeat en la time-series |
| **`IRealtimePublisher`** | puerto | Emite el heartbeat a `io.to(ownerId)`; evento `"heartbeat"` |
| `INotifier` + `INotificationStrategy` | puerto / infra | Orquesta y envía alertas concurrentes mediante múltiples proveedores (Email, Slack, Discord, Telegram, Webhook) |
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

> **Soporte robusto para Cloudflare (Estrategia HTTP):**
> Para evitar falsos DOWN causados por el firewall de Cloudflare (WAF), la estrategia `HttpChecker` debe:
> 1. Inyectar un `User-Agent` de navegador de escritorio común por defecto si no se especifica uno personalizado.
> 2. Adjuntar las cabeceras personalizadas configuradas en el monitor (ej. `Host`, cookies, `Accept`).
> 3. Configurar la librería HTTP subyacente para ignorar los errores de validación de certificados SSL/TLS si `ignoreTls` está activado (útil cuando se usan túneles o SSL flexible).

> **Validación de Palabra Clave (HTTP Keyword):**
> Si el monitor HTTP define `keyword`, el checker obtendrá el cuerpo de respuesta de la web (HTML/JSON).
> * Si `keywordMethod === "presence"` y la palabra clave **no está** en el cuerpo: el check se marca como fallido (`ok: false`, `msg: "Keyword not found"`).
> * Si `keywordMethod === "absence"` y la palabra clave **sí está**: el check se marca como fallido (`ok: false`, `msg: "Keyword found"`).

> **Estrategia DNS (`DnsChecker`):**
> Realiza una consulta al servidor especificado en `dnsResolver` (ej. `8.8.8.8`) para verificar que el dominio `target` resuelva correctamente al tipo de registro `dnsRecordType` (A, AAAA, CNAME, MX, TXT). Retorna `ok: false` si falla la resolución o no coincide el registro.

> **Estrategia Push (`PushChecker` - Pasiva):**
> A diferencia de los checkers activos, el `PushChecker` no inicia peticiones HTTP. Retorna un éxito asíncrono pasivo cada vez que el servicio externo le pega al endpoint. Es agendado únicamente en modo escucha de expiración (ver §6).
```

> **Módulo de Integridad Visual y Estructural (Detección de Defacement - Opcional en HTTP):**
> Si el monitor de tipo `http` tiene `integrityEnabled === true`, se activa el pipeline de integridad para la detección de alteraciones visuales o estructurales no autorizadas.
>
> **1. Concurrencia de Renderizado Headless (Evitando sobreingeniería):**
> Dado que el renderizado de páginas web mediante navegadores headless es una tarea intensiva en CPU y memoria, y de acuerdo con el principio del proyecto de **cero dependencias externas de infraestructura pesada** (sin Redis/Celery):
> - Se introduce una cola de concurrencia en memoria dedicada exclusivamente para tareas de renderizado e integridad: `const integrityLimit = pLimit(Number(process.env.AZKIN_INTEGRITY_CONCURRENCY ?? 5))`. Esto aísla el rendimiento de los pings rápidos (concurrencia de 50) de los análisis visuales pesados.
>
> **2. Flujo del Pipeline de Integridad por Capas:**
> ```mermaid
> graph TD
>   A[Inicio del Check HTTP] --> B{¿Código HTTP OK?}
>   B -- No (ej. 404, 500, Falla DNS) --> C[Detener Pipeline y Marcar DOWN: Servicio Caído]
>   B -- Sí --> D[Capa 2: Obtener HTML y Sanitizar DOM]
>   D --> E{¿Perfil de Análisis?}
>   E -- Estático --> F{¿Hash HTML == Base?}
>   F -- Sí --> G[Marcar UP: Integridad Confirmada (Filtrado Rápido)]
>   F -- No --> H[Proceder a Capa 3 (Visual)]
>   E -- Dinámico --> I{¿Cambio Estructural DOM > 20%?}
>   I -- No --> G
>   I -- Sí --> H
>   H --> J[integrityLimit: Levantar Navegador Headless]
>   J --> K[Cargar Página con Timeout 25s y networkidle]
>   K --> L[Ocultar Selectores CSS Ignorados]
>   L --> M[Pintar Máscaras Visuales de Negro]
>   M --> N{¿Diferencia de Píxeles > Umbral Tolerancia?}
>   N -- Sí --> O[Marcar DOWN: Posible Defacement Visual Detectado]
>   N -- No --> P{¿Script Externo No Autorizado?}
>   P -- Sí --> Q[Marcar DOWN: Inyección de Script No Autorizado]
>   P -- No --> G
> ```
>
> - **Capa 1: Disponibilidad y Red:** Se realiza la solicitud inicial. Si el servidor devuelve un error de HTTP (4xx, 5xx) o falla de resolución DNS, se interrumpe el pipeline. Retorna `ok: false` con `"Servicio Caído / Falla de DNS"`.
> - **Capa 2: Sanitización y Normalización Estructural (En Memoria - CPU):**
>   1. **Bloqueo de Scripts de Terceros (Ad-Blocker integrado):** Se purgan del HTML recuperado los scripts de redes de anuncios o rastreo mediante filtros Regex optimizados.
>   2. **Normalización del DOM:** Se remueven del DOM atributos dinámicos y tokens autogenerados (como tokens CSRF, IDs de sesión, nonces y marcas de tiempo).
>   3. **Evaluación de Perfil Estático (Filtrado Rápido):** Se calcula el hash SHA-256 del HTML normalizado. Si coincide al 100% con el hash base de referencia, el check se marca como exitoso (`ok: true`, `msg: "Integridad estructural confirmada (estático)"`) y **se cancela la Capa 3**, ahorrando ciclos de CPU del navegador headless.
>   4. **Evaluación de Perfil Dinámico:** En lugar del hash exacto del texto, se extrae el árbol de etiquetas (esqueleto del DOM) y se compara contra el esqueleto base utilizando algoritmos de distancia de edición estructural. Si la variación es de 20% o menor, el check es exitoso y se cancela la Capa 3. Si la variación estructural es `> 20%`, se procede a la evaluación visual.
> - **Capa 3: Integridad Visual y Auditoría de Scripts (Navegador Headless):**
>   1. **Carga y Renderizado:** Bajo control de la cola `integrityLimit`, se abre una pestaña en un navegador headless (ej. Puppeteer). Se establece un timeout de 15 segundos para la respuesta HTTP inicial y 25 segundos para la carga completa del sitio (`networkidle`).
>   2. **Enmascaramiento y Remoción CSS:** Se inyecta una hoja de estilo que aplica `display: none !important` a todos los elementos que coincidan con `integrityIgnoredCssSelectors`.
>   3. **Zonificación de Tolerancia (Máscara Visual):** Sobre la captura de pantalla renderizada, se pintan rectángulos negros opacos sobre las coordenadas `[x, y, ancho, alto]` de `integrityVisualMasks` para ignorar los elementos dinámicos que se muevan o cambien visualmente.
>   4. **Comparación de Píxeles:** Se calcula la diferencia de píxeles entre la captura procesada y la captura base de referencia (ej. con `pixelmatch`). Si la diferencia supera el `integrityThreshold` (ej. 10%), el check falla. Retorna `ok: false` con `"Posible Defacement Visual Detectado (Diferencia de X%)"`.
>   5. **Auditoría de Inyecciones de Scripts:** Se extraen las URLs de todos los tags `<script src="...">` cargados. Si alguna URL de script externo no coincide con la lista blanca en `integrityAllowedScripts`, el check falla de inmediato. Retorna `ok: false` con `"Inyección de Script No Autorizado"`.
>
> **3. Gestión del Estado Base / Referencia:**
> - El estado base (el hash del HTML normalizado, el esqueleto del DOM base y la captura de pantalla base de referencia) se establece por primera vez en la creación o mediante una petición manual del administrador en la UI ("Establecer como estado base").
> - Los archivos de capturas de pantalla de referencia se almacenan de manera local y aislada en un directorio dedicado dentro del volumen persistente del backend (`/data/integrity-baselines/:monitorId/`).

Añadir un tipo nuevo = una clase nueva registrada en el `CheckerRegistry`. **Cero modificación**
del motor (Open/Closed) — corrige el acoplamiento excesivo en objetos globales (God Object) de arquitecturas previas.

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
const limit = pLimit(N); // única instancia COMPARTIDA para checks de red rápidos (pings, http simple, etc.)

const INTEGRITY_N = Number(process.env.AZKIN_INTEGRITY_CONCURRENCY ?? 5);
const integrityLimit = pLimit(INTEGRITY_N); // limitador para el análisis de integridad visual pesado (Puppeteer/Playwright)
```

- El timer decide *cuándo* toca un beat; la **ejecución de red rápida** siempre pasa por `limit(...)`.
- Si el monitor tiene activado el módulo de integridad, la parte pesada de captura y renderizado visual (Capa 3) se delega a `integrityLimit(...)`. Esto evita que las tareas costosas del navegador headless bloqueen los pings estándar.
- Como el próximo beat se agenda al terminar el actual, hay **≤ 1 check en vuelo por monitor** y los límites simultáneos quedan estrictamente acotados. No hay colas descontroladas ni fugas de memoria por navegadores fantasmas.

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
  realtime.publishHeartbeat(sm.monitor.userId, beatDoc)          # (2) emitir a room del Admin propietario

  # (3) detección de transición SOLO sobre estados confirmados (PENDING no alerta)
  if status in {UP, DOWN}:
      if sm.lastStatus !== null and sm.lastStatus !== status:
          # Se consultan las notificaciones asociadas y se disparan en paralelo de forma asíncrona
          for notifId in sm.monitor.notificationIds:
              notifier.sendAlert(notifId, sm.monitor, sm.lastStatus, status, beatDoc)
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
- **Resiliencia en ejecución de red:** Cada checker (`HttpChecker`, `PingChecker`, `PortChecker`) debe implementar un `timeout` estricto (máximo 15 segundos) para evitar colgar la cola de ejecución. Cualquier excepción no controlada dentro del checker de red debe ser capturada en su propia estrategia de ejecución y devuelta como un `CheckResult` con `ok: false` y el mensaje de error correspondiente, asegurando que el planificador principal nunca falle.

---

## 6. Ciclo de vida del motor (Soporte Monitoreo Activo y Pasivo)

```
start():                                   # tras database ready (bootstrap)
  actives = await monitorRepo.findAllActive()   # contexto SISTEMA: todos los usuarios
  for m in actives: schedule(m)

schedule(monitor):
  if map.has(monitor.id): unschedule(monitor.id)
  sm = { monitor, timeout: null, lastStatus: null, retryAttempts: 0, isStopped: false }
  map.set(monitor.id, sm)
  
  if monitor.type === "push":
      # En modo pasivo, agenda un timeout de expiración. 
      # Si se vence sin recibir pings entrantes, cambia a DOWN.
      sm.timeout = setTimeout(() => handlePushTimeout(sm), monitor.interval * 1000)
  else:
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

handlePushTimeout(sm):
  # Si salta este timer, el cronjob externo falló al reportarse a tiempo
  status = DOWN
  beatDoc = { monitorId: sm.monitor.id, timestamp: now(), status, ping: null, msg: "Push heartbeat timeout: no reportado a tiempo" }
  await heartbeatRepo.save(beatDoc)
  realtime.publishHeartbeat(sm.monitor.userId, beatDoc)
  if sm.lastStatus === UP:
      notifier.sendAlert(notifId, sm.monitor, UP, DOWN, beatDoc)
  sm.lastStatus = DOWN
  # Re-agenda la espera de expiración
  if !sm.isStopped:
      sm.timeout = setTimeout(() => handlePushTimeout(sm), sm.monitor.interval * 1000)

receivePushHeartbeat(monitorId, clientStatus, clientPing, clientMsg):
  # Invocado desde la API pública GET /push/:pushToken
  sm = map.get(monitorId)
  if !sm or sm.isStopped: return
  
  clearTimeout(sm.timeout) # Detiene temporizador de expiración actual
  
  # Registra el heartbeat exitoso (o fallido según reporte del cliente)
  status = (clientStatus === "down") ? DOWN : UP
  beatDoc = { monitorId, timestamp: now(), status, ping: clientPing, msg: clientMsg ?? "Push heartbeat received" }
  await heartbeatRepo.save(beatDoc)
  realtime.publishHeartbeat(sm.monitor.userId, beatDoc)
  
  # Alerta si hay transición
  if sm.lastStatus !== null and sm.lastStatus !== status:
      for notifId in sm.monitor.notificationIds:
          notifier.sendAlert(notifId, sm.monitor, sm.lastStatus, status, beatDoc)
  sm.lastStatus = status
  
  # Re-agenda el temporizador de expiración limpio
  sm.timeout = setTimeout(() => handlePushTimeout(sm), sm.monitor.interval * 1000)
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
Admins). El aislamiento se preserva en el **momento de emitir**:

- Cada heartbeat se publica a `io.to(monitor.userId)` donde `monitor.userId` es el **Admin
  propietario** (`ownerId`).
- Los sockets Admin se unen a su propia room; los Viewers se unen a la room de su `adminId`.
- Los Viewers filtran eventos en el cliente según permisos granulares (`all` | `group` | `monitor`).

Contrato completo: [`04-contratos-api.md`](04-contratos-api.md) §13.

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
| 4 — UI/UX y frontend | [`06-ui-ux.md`](06-ui-ux.md) | ✅ Aprobada |
| 5 — Motor de monitoreo | Este documento (soportando Cloudflare) | ✅ Aprobada |
