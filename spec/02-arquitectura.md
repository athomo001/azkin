# Fase 1 — Especificación de Arquitectura y Stack: Azkin

> Estado: **Aprobada** · Metodología: Spec-Driven Development (SDD)
> Documento derivado de [`01-general.md`](01-general.md) y del análisis de ingeniería inversa de Uptime Kuma.

Este documento fija la arquitectura de referencia de Azkin **antes** de escribir código de
implementación. Cualquier decisión posterior debe justificarse contra los principios aquí definidos.

---

## 1. Principios rectores

Azkin nace de un análisis de las deudas técnicas de Uptime Kuma. Cada decisión estructural
corrige una de ellas o preserva uno de sus aciertos:

| Aprendizaje de Uptime Kuma | Decisión en Azkin |
|---|---|
| ✅ Su sistema de plugins de tipos de monitor es limpio y extensible | **Strategy Pattern** para los *checkers* (`http`/`ping`/`port`) preparado para Cloudflare (User-Agent configurable, cabeceras personalizadas y bypass opcional de validación SSL/TLS para evitar bloqueos del WAF o falsos DOWN) |
| ❌ `monitor.js` mezcla red + SQL + sockets + alertas (~2069 líneas, viola SRP) | **Clean Architecture**: el dominio no conoce Mongoose, Express ni Socket.io |
| ❌ Purga de históricos en caliente (`DELETE` en cada heartbeat, bloqueo de I/O) | **Time Series Collection** de MongoDB con `expireAfterSeconds` (purga automática) |
| ❌ CRUD de recursos exclusivamente por WebSocket (no automatizable por terceros) | **REST para mutar estado; Socket.io solo lectura** filtrado dinámicamente según permisos de visualización (Admin/Viewer) |

Filosofía transversal (heredada de `01-general.md`): **ligero, moderno y sin sobreingeniería**.
Se aplican como filtro de calidad inquebrantable: **SOLID, KISS, DRY, YAGNI, Fail Fast**.

Fronteras explícitas de YAGNI (lo que **NO** haremos en este alcance):

- ❌ Nada de Redis / BullMQ / colas distribuidas → el planificador es en memoria.
- ❌ Nada de framework de inyección de dependencias (Inversify/Nest) → *composition root* manual.
- ❌ Nada de NgRx en el frontend → estado con Signals de Angular.
- ❌ Nada de paquete de tipos compartido → cada lado declara sus propios contratos.

---

## 2. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Backend | Node.js + Express + **TypeScript estricto** (`strict: true`) | Clean Architecture |
| Base de datos | MongoDB + Mongoose | `Heartbeat` como Time Series Collection |
| Planificador | Event Loop nativo + `p-limit` | `setTimeout` recursivo por monitor |
| Tiempo real | Socket.io | *Rooms* por `user_id` (aislamiento estricto) |
| Validación | Zod | En el borde HTTP (fail-fast) |
| Auth | JWT (`jsonwebtoken`) + `bcrypt` + Cookies (`HttpOnly`) | Access Token (vida corta) + Refresh Token en cookie segura (7 días) para evitar logins recurrentes |
| Frontend | Angular en su última versión estable (Angular 19+) Standalone + **Signals** | Sin `NgModules` |
| Estilos | Tailwind CSS | Dark mode nativo (esmeralda=UP, carmesí=DOWN) |
| Gráficos | Apache ECharts | Wrapper reactivo |
| Despliegue | Docker + Docker Compose (Orquestación resiliente) | 3 servicios robustecidos: mongodb, backend, frontend |

---

## 3. Arquitectura de capas (regla de dependencia)

Todas las dependencias apuntan **hacia adentro**. Una capa externa puede depender de una interna,
nunca al revés. El dominio es TypeScript puro, testeable sin levantar Mongo ni Express.

```
┌──────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE  (frameworks, drivers — lo reemplazable)       │
│  Express Controllers · JWT Middleware · Mongoose Repos         │
│  Socket.io Gateway · HttpChecker/PingChecker · InMemoryScheduler│
└───────────────────────────────┬──────────────────────────────┘
                                 │ implementa puertos ▲
┌───────────────────────────────▼──────────────────────────────┐
│  APPLICATION  (casos de uso — orquestación)                    │
│  CreateMonitor · ExecuteCheck · GetGroupOverview · LoginUser     │
│  Puertos (interfaces): IMonitorRepository · ICheckStrategy     │
│                        IRealtimePublisher · IScheduler         │
└───────────────────────────────┬──────────────────────────────┘
                                 │ depende de ▲
┌───────────────────────────────▼──────────────────────────────┐
│  DOMAIN  (entidades + reglas puras — cero dependencias npm)    │
│  Monitor · Heartbeat · User · MonitorStatus (VO) · Interval    │
└──────────────────────────────────────────────────────────────┘
```

**Decisión aprobada:** los puertos (interfaces de repositorios y servicios) viven en
`application/ports/`. El dominio queda 100 % puro (solo entidades, value objects y reglas).

---

## 4. Layout del repositorio (monorepo)

**Decisión aprobada:** monorepo con dos carpetas hermanas, sin workspaces npm.
`compose.yaml` en la raíz orquesta ambos servicios.

```
azkin/
├── compose.yaml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── domain/
│       │   ├── entities/          Monitor.ts · Heartbeat.ts · User.ts
│       │   ├── value-objects/     MonitorStatus.ts · MonitorType.ts · Interval.ts
│       │   └── errors/            DomainError.ts (base para fail-fast)
│       ├── application/
│       │   ├── use-cases/         create-monitor.usecase.ts · execute-check.usecase.ts · execute-push-heartbeat.usecase.ts · export-backup.usecase.ts · import-backup.usecase.ts · …
│       │   ├── ports/
│       │   │   ├── repositories/  monitor.repository.ts · heartbeat.repository.ts · user.repository.ts
│       │   │   └── services/      check-strategy.ts · realtime-publisher.ts · scheduler.ts · notifier.ts
│       │   └── dtos/
│       ├── infrastructure/
│       │   ├── http/              controllers/ · routes/ · middlewares/ (auth · error · validation)
│       │   ├── realtime/          socketio.gateway.ts
│       │   ├── persistence/       mongoose/schemas/ · mongoose/repositories/
│       │   ├── checkers/          http.checker.ts · ping.checker.ts · port.checker.ts · dns.checker.ts · push.checker.ts · registry.ts
│       │   ├── notifier/          providers/ (slack.ts · telegram.ts · email.ts · discord.ts · webhook.ts) · registry.ts
│       │   ├── scheduler/         in-memory-scheduler.ts
│       │   └── config/            env.ts
│       ├── composition-root.ts    ← DI manual (KISS)
│       └── main.ts
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/app/
        ├── core/        auth.service.ts · socket.service.ts · jwt.interceptor.ts · auth.guard.ts
        ├── features/    dashboard/ · group-dashboard/ · monitor-detail/ · auth/ · settings/  (standalone)
        ├── shared/      status-badge.component.ts · latency-chart.component.ts
        └── state/       monitor-state.service.ts  (signal<IMonitor[]>)
```

**Tipos compartidos:** duplicados en cada lado. Backend y frontend declaran sus propios
DTOs/interfaces. Se acepta la posible divergencia a cambio de cero acoplamiento entre despliegues
y un build de Docker más simple. El contrato de API es pequeño y estable.

---

## 5. Puertos clave (contratos, no implementaciones)

Definen la arquitectura. Se especifican aquí a nivel conceptual; las firmas exactas de TypeScript
se detallan en la Fase 2/3.

- **`ICheckStrategy`** — `check(monitor): Promise<CheckResult>`.
  Una implementación por tipo (`HttpChecker`, `PingChecker`, `PortChecker`, `DnsChecker`, `PushChecker`), resueltas por un
  `CheckerRegistry`. Agregar un tipo nuevo = una clase nueva, **cero modificación** del núcleo
  (Open/Closed). Este es el patrón que reemplaza al God Object de Uptime Kuma.

- **`IMonitorRepository` / `IHeartbeatRepository`** — las operaciones de lectura resuelven
  `ownerId` (Admin propietario) y, si el actor es Viewer, filtran por `permissions` granulares
  (`all` | Monitor Group `group` | monitor individual). Las operaciones de escritura requieren rol
  `admin`. Ver modelo multiusuario en [`03-modelo-datos.md`](03-modelo-datos.md) §2–§3.

- **`IScheduler`** — `schedule(monitor)` / `unschedule(monitorId)`. Implementación in-memory con
  `Map<monitorId, NodeJS.Timeout>` y `setTimeout` recursivo (patrón `safeBeat`: evita solapamiento
  de checks), envuelto en `p-limit(N)` para no saturar red/CPU.

- **`IRealtimePublisher`** — `publishHeartbeat(ownerId, beat)`. La implementación Socket.io emite
  el evento `"heartbeat"` a la room del Admin propietario (`io.to(ownerId)`). Admin y Viewers se
  unen a esa room al conectar; los Viewers filtran en cliente por permisos. Contrato completo en
  [`04-contratos-api.md`](04-contratos-api.md) §13. Canal **unidireccional de solo lectura**.

- **`INotifier`** — `sendAlert(notification, monitor, from, to, beat): Promise<void>`.
  Servicio que implementa un **Strategy Pattern** para disparar alertas concurrentes a través de múltiples canales activos (`EmailNotifier`, `SlackNotifier`, `TelegramNotifier`, `DiscordNotifier`, `WebhookNotifier`) según los `notificationIds` configurados en el monitor. El motor ejecuta los envíos de forma asíncrona y no bloqueante.
  Cada canal de notificación implementa la interfaz **`INotificationStrategy`**:
  ```ts
  interface INotificationStrategy {
    readonly type: NotificationType;
    send(config: Record<string, any>, monitor: IMonitor, from: MonitorStatus, to: MonitorStatus, beat: IHeartbeat): Promise<void>;
  }
  ```
  Esto permite que añadir un proveedor nuevo sea una clase aislada registrada en el `NotifierRegistry`, sin modificar el orquestador principal.

---

## 6. Flujos arquitectónicos

### 6.1 Mutación de recursos (REST)
```
Cliente Angular ──HTTP──▶ Express Controller ──▶ Use Case ──▶ Repository (Mongoose)
                              │                      │
                       (Zod valida)         (scoped por userId)
```

### 6.2 Ejecución de un check (motor de monitoreo)
```
InMemoryScheduler (setTimeout) ──▶ ExecuteCheckUseCase
        │                                │
   p-limit(N)                    CheckerRegistry.resolve(type).check()
                                         │
                           persiste Heartbeat (Time Series)
                                         │
                           IRealtimePublisher.publishHeartbeat(monitor.userId, beat)
                                         │
                           ¿cambió UP↔DOWN? ──▶ INotifier (Multicanal en paralelo)
```

### 6.3 Tiempo real (solo lectura)

Contrato unificado — ver [`04-contratos-api.md`](04-contratos-api.md) §13.

```
Backend ──io.to(ownerId).emit("heartbeat", payload)──▶ SocketService (Angular)
              │                                              │
         ownerId = monitor.userId              Admin: actualiza todos sus monitores
         (Admin propietario)                   Viewer: filtra por permissions → signal<>
                                                            │
                                            MonitorStateService actualiza signal<>
```

---

## 7. Estrategia de testing (pirámide)

| Nivel | Alcance | Herramienta |
|---|---|---|
| Unit (base) | Dominio + casos de uso (puertos mockeados, sin I/O) | Jest / Vitest |
| Integración | Repositorios Mongoose contra Mongo efímero | `mongodb-memory-server` |
| E2E API | Endpoints REST completos | Supertest |
| E2E UI | Flujos de usuario en Angular | Playwright |

El dominio y los casos de uso se testean sin levantar infraestructura: ese es el beneficio
directo de la regla de dependencia.

---

## 8. Despliegue (Docker Compose)

Tres servicios en `compose.yaml` estructurados para máxima **robustez y resiliencia**:

- **`mongodb`** — persistencia; se inicializa la colección `Heartbeat` como Time Series. Incluye un `healthcheck` que verifica la disponibilidad antes de permitir que otros servicios interactúen con él.
- **`backend`** — imagen Node multi-stage (build TS → runtime slim) con política `restart: unless-stopped` y límites de memoria/CPU. Utiliza un mecanismo de espera inteligente (`depends_on` con condición `service_healthy`) y reintentos automáticos en la conexión de Mongoose para asegurar que el servicio no falle si la base de datos tarda en iniciar.
- **`frontend`** — build de Angular servido por nginx con políticas de reinicio automático y reconexión automática en el cliente de Socket.io ante caídas del servidor.

---

## 9. Trazabilidad de fases (SDD)

| Fase | Entregable | Estado |
|---|---|---|
| 1 — Arquitectura y stack | Este documento | ✅ Aprobada |
| 2 — Modelado de datos (Mongoose) | Interfaces + Schemas + Time Series | ⏳ Pendiente |
| 3 — Contratos de API REST | [`04-contratos-api.md`](04-contratos-api.md) | ✅ Aprobada |
| 4 — UI/UX y frontend | Vistas, componentes, estado con Signals | ⏳ Pendiente |
| 5 — Motor de monitoreo | [`05-motor-monitoreo.md`](05-motor-monitoreo.md) | ✅ Aprobada |
