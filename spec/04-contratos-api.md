# Fase 3 — Contratos de la API REST: Azkin

> Estado: **Aprobada** · Metodología: Spec-Driven Development (SDD)
> Deriva de [`01-general.md`](01-general.md) (Fase 3) sobre la arquitectura de
> [`02-arquitectura.md`](02-arquitectura.md) y el modelo de [`03-modelo-datos.md`](03-modelo-datos.md).

Define el contrato HTTP de Azkin: rutas, DTOs de request/response, códigos de estado y el
middleware de aislamiento. Sigue el principio de Fase 1: **REST muta el estado, Socket.io solo
transmite** (lectura). Aún es **spec, no implementación cableada**.

---

## 1. Convenciones transversales

| Aspecto | Decisión |
|---|---|
| **Prefijo/versión** | Todas las rutas bajo `/api/v1/` |
| **Autenticación** | Header `Authorization: Bearer <JWT>` |
| **Content-Type** | `application/json` en request y response |
| **Aislamiento** | El `userId` proviene **siempre** del JWT (`req.userId`), nunca del body/query/params |
| **Validación** | Zod en el borde (body/params). Fallo → `400` con detalles |
| **Errores** | Envelope único (ver §2) |
| **Paginación** | No aplica — la lista de monitores es por usuario y acotada (YAGNI) |
| **Tokens** | Access token JWT de vida corta, **sin refresh** (`exp` configurable, def. 2 h) |

### 1.1 Payload del JWT

```ts
interface JwtPayload {
  sub: string; // userId (ObjectId en string)
  iat: number;
  exp: number;
}
```

El `authGuard` verifica la firma y `exp`; si es válido inyecta `req.userId = payload.sub`, si no
responde `401`. **Nunca** se incluye información sensible (email/hash) en el token.

---

## 2. Formato de error (envelope único)

```ts
interface ErrorResponse {
  error: {
    code: string;            // p.ej. "VALIDATION_ERROR"
    message: string;         // legible para el cliente
    details?: unknown;       // p.ej. issues de Zod (solo en 400)
  };
}
```

| `code` | HTTP | Cuándo |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Body/params no pasan Zod |
| `UNAUTHORIZED` | 401 | Falta token / inválido / expirado |
| `INVALID_CREDENTIALS` | 401 | Login con email o password incorrectos |
| `EMAIL_TAKEN` | 409 | Registro con email ya existente |
| `NOT_FOUND` | 404 | Recurso inexistente **o de otro usuario** (ver nota) |
| `INTERNAL_ERROR` | 500 | Error no controlado |

> **Nota de seguridad:** un monitor de otro usuario devuelve `404` (no `403`) para no revelar la
> existencia de recursos ajenos (evita enumeración).

---

## 3. DTOs compartidos

```ts
// Estado numérico del dominio (0=DOWN,1=UP,2=PENDING,3=MAINTENANCE)
import { MonitorStatus } from "domain/value-objects/MonitorStatus";
import { MonitorType } from "domain/value-objects/MonitorType";

interface UserResponse {
  id: string;
  email: string;
}

// Resumen de estado ligero embebido en la lista (NO el historial completo).
interface MonitorStatusSummary {
  lastStatus: MonitorStatus | null; // null si aún no tiene heartbeats
  lastPing: number | null;          // ms del último check UP
  uptime24h: number | null;         // ratio 0..1 en las últimas 24 h
}

interface MonitorResponse extends MonitorStatusSummary {
  id: string;
  name: string;
  type: MonitorType;
  target: string;
  port?: number;
  interval: number;
  retries: number;
  retryInterval: number;
  tags: string[];
  isActive: boolean;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}
```

---

## 4. Autenticación — `/api/v1/auth`

### 4.1 `POST /register`
- **Auth:** no.
- **Request:**
```ts
interface RegisterRequest {
  email: string;    // Zod: email válido, normalizado a minúsculas
  password: string; // Zod: mínimo 8 caracteres
}
```
- **Respuesta `201`:** `AuthResponse`
```ts
interface AuthResponse {
  token: string;
  user: UserResponse;
}
```
- **Errores:** `400` (validación), `409` (`EMAIL_TAKEN`).

### 4.2 `POST /login`
- **Auth:** no.
- **Request:** `LoginRequest { email: string; password: string }`.
- **Respuesta `200`:** `AuthResponse`.
- **Errores:** `400`, `401` (`INVALID_CREDENTIALS` — mensaje genérico, sin distinguir email/password).

---

## 5. Monitores — `/api/v1/monitors` *(requieren JWT)*

### 5.1 `GET /monitors`
- **Respuesta `200`:** `MonitorResponse[]` — todos los monitores del `req.userId`, con resumen de
  estado (`lastStatus`, `lastPing`, `uptime24h`), **sin** el array histórico de heartbeats.
- **Errores:** `401`.

> El `uptime24h` y `lastStatus` se resuelven con **una sola agregación** sobre la colección
> time-series agrupada por `monitorId` (no N consultas). El cálculo detallado se cierra en Fase 5.

### 5.2 `POST /monitors`
- **Request:**
```ts
interface CreateMonitorRequest {
  name: string;             // Zod: no vacío
  type: MonitorType;        // "http" | "ping" | "port"
  target: string;           // Zod: URL si http; host/IP si ping/port
  port?: number;            // Zod: requerido si type==="port"; 1..65535
  interval: number;         // Zod: entero, mínimo 20 (segundos)
  retries?: number;         // Zod: entero ≥ 0; por defecto 0
  retryInterval?: number;   // Zod: entero, mínimo 20; por defecto 60
  tags?: string[];          // por defecto []
}
```
- **Respuesta `201`:** `MonitorResponse` (recién creado; resumen de estado en `null`).
- **Efecto lateral:** el caso de uso registra el monitor en el `IScheduler` si `isActive` (Fase 5).
- **Errores:** `400`, `401`.

### 5.3 `PUT /monitors/:id`
- **Request** (todos opcionales; `type` es **inmutable** tras la creación):
```ts
interface UpdateMonitorRequest {
  name?: string;
  target?: string;
  port?: number;
  interval?: number;
  retries?: number;
  retryInterval?: number;
  tags?: string[];
  isActive?: boolean; // pausa (false) / reanuda (true) el monitoreo
}
```
- **Respuesta `200`:** `MonitorResponse` actualizado.
- **Efecto lateral:** cambia el agendamiento en el `IScheduler` según `isActive`/`interval`.
- **Errores:** `400`, `401`, `404`.

### 5.4 `DELETE /monitors/:id`
- **Respuesta `204`:** sin body.
- **Efecto lateral:** desagenda el monitor y **borra en cascada** sus heartbeats
  (`deleteMany({ monitorId })` en la time-series).
- **Errores:** `401`, `404`.

---

## 6. Estadísticas — `/api/v1/stats` *(requieren JWT)*

### 6.1 `GET /stats/monitor/:id/history`
- **Descripción:** historial de heartbeats de las últimas 24 h de un monitor propio.
- **Respuesta `200`:**
```ts
interface HeartbeatPoint {
  timestamp: string;            // ISO-8601
  status: MonitorStatus;
  ping: number | null;
}
interface HistoryResponse {
  monitorId: string;
  range: "24h";
  points: HeartbeatPoint[];     // orden ascendente por timestamp
}
```
- **Aislamiento:** se verifica primero la propiedad del monitor (`findById(userId, id)`); si no es
  del usuario → `404` y no se consulta la time-series.
- **Errores:** `401`, `404`.

### 6.2 `GET /stats/tags`
- **Respuesta `200`:** `string[]` — tags únicos de los monitores del usuario (distinct sobre `tags`).
- **Errores:** `401`.

### 6.3 `GET /stats/tags/:tagName/overview` *(feature core)*
- **Descripción:** consolidado de todos los monitores del usuario bajo un tag.
- **Respuesta `200`:**
```ts
interface AggregatedPoint {
  timestamp: string;   // bucket temporal (ISO-8601)
  upRatio: number;     // 0..1 — fracción de monitores UP en el bucket
  avgPing: number | null;
}
interface TagOverviewResponse {
  tag: string;
  overallStatus: MonitorStatus;   // estado combinado del grupo
  avgPing: number | null;         // latencia promedio del grupo
  monitors: MonitorResponse[];    // monitores del tag (con su resumen)
  history: AggregatedPoint[];     // serie histórica promediada del grupo (24 h)
}
```
- **Errores:** `401`, `404` (tag sin monitores del usuario).

---

## 7. Middleware (cadena de infraestructura)

```
Request
  │
  ├─▶ [cors] ─▶ [json body parser]
  │
  ├─▶ [authGuard]        (rutas protegidas) → verifica JWT → req.userId | 401
  │
  ├─▶ [validate(schema)] → Zod sobre body/params → 400 con details
  │
  ├─▶ [controller] ─▶ [use case] ─▶ [repository scoped por userId]
  │
  └─▶ [errorHandler]     mapea DomainError → HTTP + ErrorResponse
```

- `authGuard`, `validate` y `errorHandler` viven en `infrastructure/http/middlewares/`.
- Los `DomainError` (p.ej. `NotFoundError`, `EmailTakenError`) se lanzan desde casos de uso y el
  `errorHandler` los traduce a su `code`/HTTP. Fail-fast desde el núcleo hacia el borde.

---

## 8. Trazabilidad de fases (SDD)

| Fase | Entregable | Estado |
|---|---|---|
| 1 — Arquitectura y stack | [`02-arquitectura.md`](02-arquitectura.md) | ✅ Aprobada |
| 2 — Modelado de datos | [`03-modelo-datos.md`](03-modelo-datos.md) | ✅ Aprobada |
| 3 — Contratos de API REST | Este documento | ✅ Aprobada |
| 4 — UI/UX y frontend | Vistas, componentes, estado con Signals | ⏳ Pendiente |
| 5 — Motor de monitoreo | Scheduler, concurrencia, flujo del ping | ⏳ Pendiente |
