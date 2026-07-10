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
| ✅ Su sistema de plugins de tipos de monitor es limpio y extensible | **Strategy Pattern** para los *checkers* (`http`/`ping`/`port`) |
| ❌ `monitor.js` mezcla red + SQL + sockets + alertas (~2069 líneas, viola SRP) | **Clean Architecture**: el dominio no conoce Mongoose, Express ni Socket.io |
| ❌ Purga de históricos en caliente (`DELETE` en cada heartbeat, bloqueo de I/O) | **Time Series Collection** de MongoDB con `expireAfterSeconds` (purga automática) |
| ❌ CRUD de recursos exclusivamente por WebSocket (no automatizable por terceros) | **REST para mutar estado; Socket.io solo lectura** (broadcast a la *room* del usuario) |

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
| Auth | JWT (`jsonwebtoken`) + `bcrypt` | Middleware extrae `user_id` del token |
| Frontend | Angular 17+ Standalone + **Signals** | Sin `NgModules` |
| Estilos | Tailwind CSS | Dark mode nativo (esmeralda=UP, carmesí=DOWN) |
| Gráficos | Apache ECharts | Wrapper reactivo |
| Despliegue | Docker + Docker Compose | 3 servicios: mongodb, backend, frontend |

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
│  CreateMonitor · ExecuteCheck · GetTagOverview · LoginUser     │
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
│       │   ├── use-cases/         create-monitor.usecase.ts · execute-check.usecase.ts · …
│       │   ├── ports/
│       │   │   ├── repositories/  monitor.repository.ts · heartbeat.repository.ts · user.repository.ts
│       │   │   └── services/      check-strategy.ts · realtime-publisher.ts · scheduler.ts · notifier.ts
│       │   └── dtos/
│       ├── infrastructure/
│       │   ├── http/              controllers/ · routes/ · middlewares/ (auth · error · validation)
│       │   ├── realtime/          socketio.gateway.ts
│       │   ├── persistence/       mongoose/schemas/ · mongoose/repositories/
│       │   ├── checkers/          http.checker.ts · ping.checker.ts · port.checker.ts · registry.ts
│       │   ├── scheduler/         in-memory-scheduler.ts
│       │   └── config/            env.ts
│       ├── composition-root.ts    ← DI manual (KISS)
│       └── main.ts
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/app/
        ├── core/        auth.service.ts · socket.service.ts · jwt.interceptor.ts · auth.guard.ts
        ├── features/    dashboard/ · tag-dashboard/ · monitor-detail/ · auth/  (standalone)
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
  Una implementación por tipo (`HttpChecker`, `PingChecker`, `PortChecker`), resueltas por un
  `CheckerRegistry`. Agregar un tipo nuevo = una clase nueva, **cero modificación** del núcleo
  (Open/Closed). Este es el patrón que reemplaza al God Object de Uptime Kuma.

- **`IMonitorRepository` / `IHeartbeatRepository`** — toda operación recibe `userId` como
  parámetro obligatorio. El aislamiento multiusuario se garantiza en el borde del repositorio;
  jamás se confía en un `userId` provisto por el cliente (fail-fast).

- **`IScheduler`** — `schedule(monitor)` / `unschedule(monitorId)`. Implementación in-memory con
  `Map<monitorId, NodeJS.Timeout>` y `setTimeout` recursivo (patrón `safeBeat`: evita solapamiento
  de checks), envuelto en `p-limit(N)` para no saturar red/CPU.

- **`IRealtimePublisher`** — `publishHeartbeat(userId, beat)`. La implementación Socket.io emite a
  `io.to(userId)`. Canal **unidireccional de solo lectura**.

- **`INotifier`** *(seam, no se construye en Fase 1)* — punto de extensión para alertas cuando un
  monitor cambia de estado. Se deja la interfaz preparada, sin proveedores (YAGNI).

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
                          IRealtimePublisher.publishHeartbeat(userId, beat)
                                         │
                          ¿cambió UP↔DOWN? ──▶ INotifier (futuro)
```

### 6.3 Tiempo real (solo lectura)
```
Backend ──io.to(userId).emit("heartbeat", beat)──▶ SocketService (Angular)
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

Tres servicios en `compose.yaml`:

- **`mongodb`** — persistencia; se inicializa la colección `Heartbeat` como Time Series.
- **`backend`** — imagen Node multi-stage (build TS → runtime slim).
- **`frontend`** — build de Angular servido por nginx.

---

## 9. Trazabilidad de fases (SDD)

| Fase | Entregable | Estado |
|---|---|---|
| 1 — Arquitectura y stack | Este documento | ✅ Aprobada |
| 2 — Modelado de datos (Mongoose) | Interfaces + Schemas + Time Series | ⏳ Pendiente |
| 3 — Contratos de API REST | Endpoints, DTOs, middleware de aislamiento | ⏳ Pendiente |
| 4 — UI/UX y frontend | Vistas, componentes, estado con Signals | ⏳ Pendiente |
| 5 — Motor de monitoreo | Scheduler, concurrencia, flujo del ping | ⏳ Pendiente |
