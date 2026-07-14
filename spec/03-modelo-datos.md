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

## 2. Modelo multiusuario (Admin / Viewer)

Azkin soporta **múltiples cuentas Admin** con alcance global sobre el sistema y
**múltiples Viewers** (usuarios normales).
No existe aislamiento por tenant entre Admins: cualquier Admin puede ver y modificar
los recursos del sistema según reglas de rol.

| Rol | Capacidades | Relación |
|---|---|---|
| **Admin** | CRUD global de monitores, notificaciones, respaldos y gestión de usuarios | `adminId` ausente |
| **Viewer** | Solo lectura de monitores autorizados por permisos granulares | `adminId` opcional (referencia de creación/auditoría) |

**Flujo de alta de usuarios:**

1. `POST /register` crea una cuenta **Admin** (registro libre; sin separación por tenant).
2. Un Admin autenticado crea Viewers con `POST /users` (email + password inicial).
3. El Admin asigna permisos granulares con `PUT /users/:id/permissions`.
4. El Viewer inicia sesión con `POST /login` y solo ve los recursos permitidos.

**Resolución de autorización en repositorios y casos de uso:**

```ts
// Pseudocódigo de autorización — la lógica vive en application layer
function canViewMonitor(user: IUser, monitor: IMonitor): boolean {
  if (user.role === "admin") return true;
  return user.permissions.some(p =>
    p.type === "all" ||
    (p.type === "group" && p.value === monitor.group) ||
    (p.type === "monitor" && p.value === monitor.id)
  );
}
```

> Los permisos de Viewer operan sobre **`group`** (Monitor Group) o **`monitor`** (página/monitor
> individual). **Nunca** sobre `tags` — las tags son etiquetas libres de filtrado, no de autorización.

---

## 3. Monitor Group vs Tags (conceptos distintos)

Son dos campos del monitor con propósitos **no intercambiables**:

| Campo | Tipo | Propósito | Usado en permisos | Usado en dashboard |
|---|---|---|---|---|
| **`group`** | `string \| null` | **Monitor Group** — agrupación jerárquica principal (ej. `"Netics"`, `"Netics/Web"`, `"Infra/DB"`) | **Sí** (`permission.type === "group"`) | **Sí** — `GroupDashboardView`, listado colapsable |
| **`tags`** | `string[]` | Etiquetas libres de clasificación (ej. `["production", "critical"]`) | **No** | Solo filtrado/búsqueda en UI |

**Convención de jerarquía en `group`:** se usa el separador `/` para niveles anidados
(`"Netics/GLPI"`, `"Netics/Web/Portal"`). Un monitor pertenece a **un solo** Monitor Group.
El dashboard agrupa por el valor exacto de `group`; la UI puede colapsar prefijos comunes
(ej. todos los que empiezan por `"Netics/"`).

**Regla de nomenclatura en código y rutas:**

- Usar siempre **`group`** / **`Monitor Group`** / **`groupName`** para agrupación jerárquica.
- Usar **`tags`** / **`tag`** solo para etiquetas libres.
- Prohibido mezclar: no usar `tag-dashboard`, `GetTagOverview` ni “tags asignados” para permisos.

---

## 4. Diagrama de relaciones

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

## 5. Value Objects (dominio)

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
export type MonitorType = "http" | "ping" | "port" | "dns" | "push";
```

---

## 6. Interfaces de dominio (TS puro)

```ts
// domain/entities/User.ts
export type UserRole = "admin" | "viewer";

export interface IUserPermission {
  type: "all" | "group" | "monitor";
  value?: string; // nombre del grupo (Monitor Group) o ID del monitor
}

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;           // nunca se expone hacia afuera del dominio
  role: UserRole;
  adminId?: string;               // obligatorio si role === "viewer": ID del Admin propietario
  permissions: IUserPermission[]; // permisos granulares (solo para viewers; [] para admins)
  isTvSessionEnabled?: boolean;   // permite logins prolongados (ej. 1 año) para pantallas fijas (TV)
  preferences: {
    nyanCatMode: boolean;         // activa el easter egg de Nyan Cat en los gráficos
  };
  createdAt: Date;
  updatedAt: Date;
}
```

```ts
// domain/entities/Monitor.ts
import { MonitorType } from "../value-objects/MonitorType";

export interface IVisualMask {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IMonitor {
  id: string;
  userId: string;
  name: string;
  type: MonitorType;
  target: string;        // URL (http) | host/IP (ping, port, dns) | opcional para tipo "push"
  port?: number;         // requerido SOLO cuando type === "port"
  interval: number;      // segundos entre checks (mínimo 20)
  retries: number;       // reintentos antes de marcar DOWN (0 = inmediato)
  retryInterval: number; // segundos entre reintentos, en estado PENDING (mínimo 20)
  group: string | null;  // Monitor Group jerárquico (ej. "Netics/Web"; null si sin grupo)
  tags: string[];        // etiquetas libres; NO usadas en permisos ni agrupación de dashboard
  isActive: boolean; // pausa/reanuda el monitoreo
  notificationIds: string[]; // listado de canales de alertas asignados (INotification)
  // Campos específicos adicionales (Uptime Kuma Wiki)
  pushToken?: string;   // Token único para recibir heartbeats pasivos (tipo "push")
  keyword?: string;     // Palabra clave a comprobar en la respuesta HTTP
  keywordMethod?: "presence" | "absence";
  dnsResolver?: string; // Servidor DNS específico (ej. "8.8.8.8")
  dnsRecordType?: "A" | "AAAA" | "CNAME" | "MX" | "TXT";
  // Soporte para Cloudflare y peticiones avanzadas
  headers?: Record<string, string>; // cabeceras HTTP personalizadas (ej. Host, cookies, etc.)
  userAgent?: string;               // User-Agent configurable para evitar bloqueos por WAF
  ignoreTls?: boolean;              // si es true, no aborta ante fallos de certificados TLS/SSL
  
  // Módulo de Integridad Visual y Estructural (Detección de Defacement)
  integrityEnabled?: boolean;                      // toggle para activar el módulo (false por defecto)
  integrityProfile?: "static" | "dynamic";          // perfil de análisis (static o dynamic)
  integrityIgnoredCssSelectors?: string[];         // selectores CSS a remover antes de evaluar
  integrityVisualMasks?: IVisualMask[];            // coordenadas para pintar de negro en la captura de pantalla
  integrityAllowedScripts?: string[];              // lista blanca de urls de scripts autorizados
  integrityThreshold?: number;                     // umbral de tolerancia visual para cambio de píxeles (ej: 0.10 para 10%)
  
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

// domain/entities/Notification.ts
export type NotificationType = "email" | "slack" | "telegram" | "discord" | "webhook";

export interface INotification {
  id: string;
  userId: string;
  name: string;
  type: NotificationType;
  config: Record<string, unknown>; // parámetros del proveedor (ej. webhookUrl, smtp, etc.)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 7. Schemas de Mongoose (infraestructura)

### 5.1 User

```ts
// infrastructure/persistence/mongoose/schemas/user.schema.ts
import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "viewer"], default: "admin", required: true },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
      required: function () {
        return this.role === "viewer";
      },
    },
    permissions: [
      {
        type: { type: String, enum: ["all", "group", "monitor"], required: true },
        value: { type: String } // nombre del grupo o ID del monitor asignado
      }
    ],
    isTvSessionEnabled: { type: Boolean, default: false },
    preferences: {
      nyanCatMode: { type: Boolean, default: false }
    }
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
    type: { type: String, enum: ["http", "ping", "port", "dns", "push"], required: true },
    target: {
      type: String,
      required: function () {
        return this.type !== "push"; // target no es obligatorio para push (pasivo)
      },
      trim: true
    },
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
    // Soporte para Push, DNS y Keywords
    pushToken: { type: String, default: null, index: true },
    keyword: { type: String, default: null },
    keywordMethod: { type: String, enum: ["presence", "absence"], default: "presence" },
    dnsResolver: { type: String, default: null },
    dnsRecordType: { type: String, enum: ["A", "AAAA", "CNAME", "MX", "TXT"], default: "A" },
    group: { type: String, default: null, trim: true, index: true }, // Monitor Group (jerárquico)
    tags: { type: [String], default: [] }, // etiquetas libres (sin rol en permisos)
    isActive: { type: Boolean, default: true },
    notificationIds: [{ type: Schema.Types.ObjectId, ref: "Notification", default: [] }],
    // Campos de robustez y compatibilidad con Cloudflare
    headers: { type: Map, of: String, default: {} },
    userAgent: { type: String, default: "" },
    ignoreTls: { type: Boolean, default: false },

    // Módulo de Integridad Visual y Estructural (Detección de Defacement)
    integrityEnabled: { type: Boolean, default: false },
    integrityProfile: { type: String, enum: ["static", "dynamic"], default: "static" },
    integrityIgnoredCssSelectors: { type: [String], default: [] },
    integrityVisualMasks: [
      {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true }
      }
    ],
    integrityAllowedScripts: { type: [String], default: [] },
    integrityThreshold: { type: Number, default: 0.10 } // 10% de tolerancia por defecto
  },
  { timestamps: true, versionKey: false }
);

// Índice multikey para consultas y listados
monitorSchema.index({ userId: 1, group: 1 });

export const MonitorModel = model("Monitor", monitorSchema);

// infrastructure/persistence/mongoose/schemas/notification.schema.ts
const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["email", "slack", "telegram", "discord", "webhook"], required: true },
    config: { type: Schema.Types.Mixed, default: {} }, // guarda tokens, urls, host, etc.
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, versionKey: false }
);

export const NotificationModel = model("Notification", notificationSchema);
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

## 8. Estrategia de autorización multiusuario

Regla: **no hay aislamiento por tenant entre Admins**. El control de acceso se define por rol:
Admin con acceso global y Viewer con permisos granulares. Se aplica en cuatro niveles:

1. **Monitor / Notification** — los documentos mantienen `userId` para trazabilidad de creación.
  - **Admin:** acceso global (sin filtro de tenant).
  - **Viewer:** acceso limitado por `permissions` (`all` | `group` | `monitor`).
   - Jamás se confía en un `userId` provisto por el cliente (viene del JWT + resolución de `adminId`).
2. **Heartbeat** — la colección time-series usa `metaField: 'monitorId'` (sin `userId` denormalizado).
  Antes de consultar heartbeats se verifica permiso de rol; si falla → `404`.
3. **Gestión de Viewers** — cualquier Admin puede listar/editar/eliminar usuarios normales (Viewers).
4. **Tiempo real (Socket.io)** — ver contrato unificado en [`04-contratos-api.md`](04-contratos-api.md) §13.
  Resumen: los Admins reciben eventos de todo el sistema; los Viewers consumen eventos según permisos.

---

## 9. Decisiones de diseño (registro)

| Decisión | Elección | Justificación |
|---|---|---|
| Destino del monitor | `target: string` + `port?: number` | Puerto tipado como número; validación por tipo en el borde. Evita *stringly-typed* sin sobreingeniería |
| `status` | Numérico (0–3) en persistencia, enum en dominio | Compacidad en time-series (muchísimos docs); claridad semántica en el núcleo |
| `passwordHash` | `select: false` | El hash no sale en queries por defecto |
| Aislamiento heartbeat | `metaField: monitorId` + check de propiedad | Time-series liviana, sin denormalizar un dato inmutable |
| Purga de históricos | `expireAfterSeconds` (TTL nativo) | Corrige la deuda de I/O de Uptime Kuma (DELETE en caliente) |
| `group` vs `tags` | Campo `group` (string) + `tags` (array) | `group` = Monitor Group jerárquico (permisos + dashboard); `tags` = etiquetas libres (solo filtrado UI) |
| `tags` | `[String]` embebido | Consultas de filtrado rápido; **no** interviene en autorización |
| `adminId` en User | Opcional para viewers | Referencia de creación/auditoría; no define aislamiento por tenant |
| `interval` | mínimo 20 s, default 60 s | Evita saturar red/CPU; alinado con límites razonables |
| `retries` / `retryInterval` | reintentos antes de DOWN (añadido en Fase 5) | Reduce falsos positivos por fallos de red puntuales; durante los reintentos el estado es PENDING |
| Cuota de monitores | Máximo 50 por usuario | Previene abusos de recursos y denegación de servicio en el motor de monitoreo global |

---

## 10. Trazabilidad de fases (SDD)

| Fase | Entregable | Estado |
|---|---|---|
| 1 — Arquitectura y stack | [`02-arquitectura.md`](02-arquitectura.md) | ✅ Aprobada |
| 2 — Modelado de datos | Este documento | ✅ Aprobada |
| 3 — Contratos de API REST | [`04-contratos-api.md`](04-contratos-api.md) | ✅ Aprobada |
| 4 — UI/UX y frontend | Vistas, componentes, estado con Signals | ⏳ Pendiente |
| 5 — Motor de monitoreo | [`05-motor-monitoreo.md`](05-motor-monitoreo.md) | ✅ Aprobada |
