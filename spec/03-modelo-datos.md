# Fase 2 — Modelado de Datos (MongoDB + Mongoose): Azkin

> Estado: **Aprobada** · Metodología: Spec-Driven Development (SDD)
> Deriva de [`01-general.md`](01-general.md) (Fase 2) y respeta la arquitectura de [`02-arquitectura.md`](02-arquitectura.md).

Define el modelo de datos de Azkin: **interfaces de dominio (TS puro)** y **schemas de Mongoose
(infraestructura)**, mantenidos como artefactos separados según la regla de dependencia de Clean
Architecture. Aún es **spec, no implementación cableada**.

---

## 1. Principio de separación

El dominio no conoce Mongoose. Cada concepto vive en dos artefactos distintos:

| Concepto | Interfaz de dominio (TS puro) | Schema de persistencia (Mongoose) |
|---|---|---|
| Usuario | `IUser` en `domain/entities/User.ts` | `UserModel` en `infrastructure/persistence/mongoose/schemas/` |
| Monitor | `IMonitor` en `domain/entities/Monitor.ts` | `MonitorModel` |
| Heartbeat | `IHeartbeat` en `domain/entities/Heartbeat.ts` | `HeartbeatModel` (Time Series) |

El repositorio (infraestructura) traduce documento Mongoose ↔ entidad de dominio mediante un
*mapper* (`toDomain(doc): IMonitor`), aislando `_id`/`__v` del núcleo.

---

## 2. Diagrama de relaciones

```
┌──────────┐         ┌───────────────┐         ┌────────────────────────────┐
│  users   │ 1     N │   monitors    │ 1     N │  heartbeats (TIME SERIES)  │
│──────────│◀────────│───────────────│◀────────│────────────────────────────│
│ _id      │ userId  │ _id           │monitorId│ timestamp   (timeField)    │
│ email 🔒 │         │ userId (ref)  │         │ monitorId   (metaField)    │
│ passHash │         │ name          │         │ status  (0|1|2|3)          │
│ ts       │         │ type          │         │ ping    (ms | null)        │
└──────────┘         │ target        │         │ msg     (string | null)    │
                     │ port?         │         │ ── TTL 30d (expireAfter) ──│
                     │ interval      │         └────────────────────────────┘
                     │ retries       │
                     │ retryInterval │
                     │ tags: [String]│
                     │ isActive      │
                     │ ts            │
                     └───────────────┘
```

---

## 3. Value Objects (dominio)

```ts
// domain/value-objects/MonitorStatus.ts
// Numérico para compacidad en la colección time-series (millones de documentos).
export enum MonitorStatus {
  DOWN = 0,
  UP = 1,
  PENDING = 2,
  MAINTENANCE = 3,
}

// domain/value-objects/MonitorType.ts
export type MonitorType = "http" | "ping" | "port";
```

---

## 4. Interfaces de dominio (TS puro)

```ts
// domain/entities/User.ts
export interface IUser {
  id: string;
  email: string;
  passwordHash: string; // nunca se expone hacia afuera del dominio
  createdAt: Date;
  updatedAt: Date;
}
```

```ts
// domain/entities/Monitor.ts
import { MonitorType } from "../value-objects/MonitorType";

export interface IMonitor {
  id: string;
  userId: string;
  name: string;
  type: MonitorType;
  target: string;    // URL (http) | host/IP (ping, port)
  port?: number;     // requerido SOLO cuando type === "port"
  interval: number;      // segundos entre checks (mínimo 20)
  retries: number;       // reintentos antes de marcar DOWN (0 = inmediato)
  retryInterval: number; // segundos entre reintentos, en estado PENDING (mínimo 20)
  tags: string[];
  isActive: boolean; // pausa/reanuda el monitoreo
  createdAt: Date;
  updatedAt: Date;
}
```

```ts
// domain/entities/Heartbeat.ts
import { MonitorStatus } from "../value-objects/MonitorStatus";

// Medición append-only: no tiene identidad propia (sin id en el dominio).
export interface IHeartbeat {
  monitorId: string;
  timestamp: Date;
  status: MonitorStatus;
  ping: number | null; // latencia ms; null cuando DOWN o no medible
  msg: string | null;  // mensaje de estado (ej. "200 - OK", "timeout")
}
```

---

## 5. Schemas de Mongoose (infraestructura)

### 5.1 User

```ts
// infrastructure/persistence/mongoose/schemas/user.schema.ts
import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select:false → el hash nunca vuelve en queries por defecto (seguridad).
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true, versionKey: false }
);

export const UserModel = model("User", userSchema);
```

### 5.2 Monitor

```ts
// infrastructure/persistence/mongoose/schemas/monitor.schema.ts
import { Schema, model } from "mongoose";

const monitorSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["http", "ping", "port"], required: true },
    target: { type: String, required: true, trim: true },
    // Fail-fast a nivel de schema: port obligatorio solo para type "port".
    port: {
      type: Number,
      min: 1,
      max: 65535,
      required: function () {
        return this.type === "port";
      },
    },
    interval: { type: Number, required: true, min: 20, default: 60 },
    retries: { type: Number, required: true, min: 0, default: 0 },
    retryInterval: { type: Number, required: true, min: 20, default: 60 },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

// Índice multikey para GET /tags/:tagName/overview y listados por usuario.
monitorSchema.index({ userId: 1, tags: 1 });

export const MonitorModel = model("Monitor", monitorSchema);
```

> Nota TS: el validador `required` usa `function () {}` (no arrow) para acceder a `this` como
> documento Mongoose. La validación semántica fina (URL válida para http, etc.) se refuerza con
> **Zod en el borde HTTP** (Fase 3) — doble muro: borde + persistencia.

### 5.3 Heartbeat (Time Series Collection)

```ts
// infrastructure/persistence/mongoose/schemas/heartbeat.schema.ts
import { Schema, model } from "mongoose";

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30; // 2_592_000

const heartbeatSchema = new Schema(
  {
    timestamp: { type: Date, required: true },
    monitorId: { type: Schema.Types.ObjectId, ref: "Monitor", required: true },
    status: { type: Number, enum: [0, 1, 2, 3], required: true },
    ping: { type: Number, default: null },
    msg: { type: String, default: null },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "monitorId",
      granularity: "minutes",
    },
    expireAfterSeconds: THIRTY_DAYS_IN_SECONDS, // MongoDB purga solo (sin DELETE en caliente)
    versionKey: false,
  }
);

// Acelera GET /monitor/:id/history (últimas 24 h).
heartbeatSchema.index({ monitorId: 1, timestamp: -1 });

export const HeartbeatModel = model("Heartbeat", heartbeatSchema);
```

**Restricciones de una Time Series Collection (a tener en cuenta):**

- No admite índices `unique` → la unicidad no se puede forzar a nivel de colección (no la necesitamos).
- Optimizada para inserción append-only y consultas por rango de tiempo + metaField.
- El borrado en cascada (`deleteMany({ monitorId })`) es válido y se usa en `DELETE /monitors/:id`.
- Requiere MongoDB ≥ 5.0.

---

## 6. Estrategia de aislamiento multiusuario

Regla: **ningún dato de un usuario es alcanzable por otro**. Se aplica en tres niveles:

1. **Monitor** — todo documento lleva `userId`. Cada método del `MonitorRepository` recibe `userId`
   y filtra por él. Jamás se confía en un `userId` provisto por el cliente (viene del JWT).
2. **Heartbeat** — la colección time-series usa `metaField: 'monitorId'` (sin `userId` denormalizado).
   El aislamiento se garantiza en la capa de aplicación: **antes de consultar heartbeats se verifica
   la propiedad del monitor** (`MonitorRepository.findById(userId, monitorId)`); si no pertenece al
   usuario → error 404/403 y no se ejecuta la consulta de series.
3. **Tiempo real** — cada socket se une a la *room* `userId`; los heartbeats se emiten con
   `io.to(userId).emit(...)`.

---

## 7. Decisiones de diseño (registro)

| Decisión | Elección | Justificación |
|---|---|---|
| Destino del monitor | `target: string` + `port?: number` | Puerto tipado como número; validación por tipo en el borde. Evita *stringly-typed* sin sobreingeniería |
| `status` | Numérico (0–3) en persistencia, enum en dominio | Compacidad en time-series (muchísimos docs); claridad semántica en el núcleo |
| `passwordHash` | `select: false` | El hash no sale en queries por defecto |
| Aislamiento heartbeat | `metaField: monitorId` + check de propiedad | Time-series liviana, sin denormalizar un dato inmutable |
| Purga de históricos | `expireAfterSeconds` (TTL nativo) | Corrige la deuda de I/O de Uptime Kuma (DELETE en caliente) |
| `tags` | `[String]` embebido | Consultas rápidas sin colección adicional (fiel al spec) |
| `interval` | mínimo 20 s, default 60 s | Evita saturar red/CPU; alineado con límites razonables |
| `retries` / `retryInterval` | reintentos antes de DOWN (añadido en Fase 5) | Reduce falsos positivos por fallos de red puntuales; durante los reintentos el estado es PENDING |

---

## 8. Trazabilidad de fases (SDD)

| Fase | Entregable | Estado |
|---|---|---|
| 1 — Arquitectura y stack | [`02-arquitectura.md`](02-arquitectura.md) | ✅ Aprobada |
| 2 — Modelado de datos | Este documento | ✅ Aprobada |
| 3 — Contratos de API REST | Endpoints, DTOs, middleware de aislamiento | ⏳ Pendiente |
| 4 — UI/UX y frontend | Vistas, componentes, estado con Signals | ⏳ Pendiente |
| 5 — Motor de monitoreo | Scheduler, concurrencia, flujo del ping | ⏳ Pendiente |
