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
| **Tokens** | Access token JWT (15 min) + Refresh Token en cookie segura (7 días). Para sesiones especiales de pantallas de monitoreo (Viewer con `isTvSessionEnabled`), el servidor emite un Refresh Token persistente de 1 año para evitar re-autenticaciones repetitivas. |

### 1.1 Payload del JWT

```ts
interface JwtPayload {
  sub: string;  // userId (ObjectId en string)
  role: string; // "admin" | "viewer"
  iat: number;
  exp: number;
}
```

El `authGuard` verifica la firma y `exp`; si es válido inyecta `req.userId = payload.sub` y `req.userRole = payload.role`, si no
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
  role: string;
  permissions: { type: string; value?: string }[];
  isTvSessionEnabled: boolean;
  preferences: {
    nyanCatMode: boolean;
  };
}

// Resumen de estado ligero embebido en la lista (NO el historial completo).
interface MonitorStatusSummary {
  lastStatus: MonitorStatus | null; // null si aún no tiene heartbeats
  lastPing: number | null;          // ms del último check UP
  uptime24h: number | null;         // ratio 0..1 en las últimas 24 h
  lastErrorMsg: string | null;      // último mensaje de error si el estado es DOWN o PENDING (ej. "502 Bad Gateway")
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
  group: string | null;
  tags: string[];
  isActive: boolean;
  notificationIds: string[]; // IDs de notificaciones configuradas
  // Soporte para Cloudflare y peticiones avanzadas
  headers?: Record<string, string>;
  userAgent?: string;
  ignoreTls?: boolean;
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
- **Respuesta `201`:** `AuthResponse` (asigna la cookie `refreshToken` de 7 días y retorna el access token).
- **Errores:** `400` (validación), `409` (`EMAIL_TAKEN`).

### 4.2 `POST /login`
- **Auth:** no.
- **Request:** `LoginRequest { email: string; password: string }`.
- **Respuesta `200`:** `AuthResponse` (asigna la cookie `refreshToken` y retorna el access token).
- **Errores:** `400`, `401` (`INVALID_CREDENTIALS` — mensaje genérico, sin distinguir email/password).

### 4.3 `POST /refresh`
- **Auth:** no (requiere la cookie `refreshToken`).
- **Descripción:** Emite un nuevo access token JWT de corta duración renovando automáticamente la cookie `refreshToken` si es válida.
- **Respuesta `200`:** `AuthResponse`.
- **Errores:** `401` (cookie faltante, inválida o expirada).

### 4.4 `POST /logout`
- **Auth:** sí.
- **Descripción:** Elimina la cookie `refreshToken` del cliente.
- **Respuesta `204`:** sin body.
- **Errores:** `401`.

---

## 5. Monitores — `/api/v1/monitors` *(requieren JWT)*

### 5.1 `GET /monitors`
- **Respuesta `200`:** `MonitorResponse[]`.
  - Si el rol es `admin`, retorna todos los monitores bajo su cuenta.
  - Si el rol es `viewer`, retorna únicamente los monitores del admin que coincidan con sus reglas de permisos (por ID del monitor o pertenecientes a tags asignados).
- **Errores:** `401`.

> El `uptime24h` y `lastStatus` se resuelven con **una sola agregación** sobre la colección
> time-series agrupada por `monitorId` (no N consultas). El cálculo detallado se cierra en Fase 5.

### 5.2 `POST /monitors`
- **Request:**
```ts
interface CreateMonitorRequest {
  name: string;             // Zod: no vacío, máx 255 caracteres
  type: MonitorType;        // "http" | "ping" | "port"
  target: string;           // Zod: URL si http (máx 512), host/IP si ping/port (máx 255)
  port?: number;            // Zod: requerido si type==="port"; 1..65535
  interval: number;         // Zod: entero, mínimo 20 (segundos)
  retries?: number;         // Zod: entero ≥ 0; por defecto 0
  retryInterval?: number;   // Zod: entero, mínimo 20; por defecto 60
  group?: string | null;    // Zod: string o null, máx 100 caracteres (Monitor Group, ej. "Netics")
  tags?: string[];          // por defecto []; Zod: strings individuales máx 50 caracteres, máx 10 tags
  notificationIds?: string[]; // Zod: array de ObjectId strings válidos (opcional)
  // Soporte Cloudflare
  headers?: Record<string, string>; // cabeceras HTTP personalizadas
  userAgent?: string;               // User-Agent configurable
  ignoreTls?: boolean;              // omitir validación SSL
}
```
- **Respuesta `201`:** `MonitorResponse`.
- **Efecto lateral:** el caso de uso verifica que el usuario no supere la **cuota máxima de 50 monitores** totales, e inyecta el monitor en el `IScheduler` si `isActive` (Fase 5).
- **Errores:** `400` (validación / cuota superada), `401`.

### 5.3 `PUT /monitors/:id`
- **Request** (todos opcionales; `type` es **inmutable** tras la creación):
```ts
interface UpdateMonitorRequest {
  name?: string;            // Zod: no vacío, máx 255
  target?: string;          // Zod: URL o host/IP (máx 512)
  port?: number;
  interval?: number;
  retries?: number;
  retryInterval?: number;
  group?: string | null;    // Zod: string o null, máx 100
  tags?: string[];          // Zod: strings individuales máx 50, máx 10 tags
  notificationIds?: string[]; // Zod: array de ObjectId strings
  isActive?: boolean; // pausa (false) / reanuda (true) el monitoreo
  headers?: Record<string, string>;
  userAgent?: string;
  ignoreTls?: boolean;
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
- **Descripción:** historial de heartbeats de las últimas 24 h de un monitor.
- **Aislamiento/Permisos:**
  - Si es `admin`, verifica propiedad del monitor.
  - Si es `viewer`, verifica que el monitor específico o su grupo (`group`) asociado esté listado en sus permisos de lectura.
  - Si no tiene permisos → `404` (para no revelar existencia).
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
- **Errores:** `401`, `404`.

### 6.2 `GET /stats/groups`
- **Respuesta `200`:** `string[]` — grupos de monitores a los que el usuario tiene acceso (distinct sobre los monitores visibles).
- **Errores:** `401`.

### 6.3 `GET /stats/groups/:groupName/overview` *(feature core)*
- **Descripción:** consolidado de todos los monitores bajo un Monitor Group autorizado.
- **Autorización:** el usuario (viewer) debe tener permiso explícito sobre el grupo `:groupName` o sobre al menos uno de los monitores que lo contienen.
- **Respuesta `200`:**
```ts
interface MonitorHistoryPoints {
  monitorId: string;
  monitorName: string;
  points: {
    timestamp: string;          // ISO-8601
    status: MonitorStatus;
    ping: number | null;
  }[];
}
interface GroupOverviewResponse {
  group: string;
  overallStatus: MonitorStatus;   // estado combinado del grupo (degradado si al menos uno falla)
  avgPing: number | null;         // latencia promedio general del grupo
  monitors: MonitorResponse[];    // monitores del grupo (incluyen su lastErrorMsg descriptivo si aplica)
  history: MonitorHistoryPoints[]; // histórico detallado por monitor (24 h) para renderizar gráfico multilínea
}
```
- **Errores:** `401`, `404` (grupo sin monitores del usuario).

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

## 8. Respaldos y Exportación — `/api/v1/backup` *(requieren JWT)*

### 8.1 `GET /backup/export`
- **Descripción:** Exporta la configuración de todos los monitores del usuario autenticado.
- **Respuesta `200`:**
```ts
interface BackupExportResponse {
  version: string;     // versión de la estructura de exportación
  exportedAt: string;  // ISO-8601
  monitors: Omit<CreateMonitorRequest, "userId">[];
}
```
- **Errores:** `401`.

### 8.2 `POST /backup/import`
- **Descripción:** Importa una lista de monitores al perfil del usuario. Si un monitor ya existe por nombre o target, se actualiza; si no, se crea. Requiere rol `admin`.
- **Reglas de seguridad y sanitización:**
  1. Se eliminan o regeneran todos los IDs (`id` o `_id`) del body para prevenir inyección de identificadores ajenos.
  2. El campo `userId` se sobreescribe incondicionalmente con el del `Admin` autenticado.
  3. Si la importación supera la **cuota máxima de 50 monitores por usuario**, la petición aborta con código `400`.
- **Request:**
```ts
interface BackupImportRequest {
  monitors: CreateMonitorRequest[];
}
```
- **Respuesta `200`:**
```ts
interface BackupImportResponse {
  importedCount: number;
  updatedCount: number;
}
```
- **Errores:** `400` (estructura JSON inválida o límite de cuota excedido), `401`, `403` (no admin).

### 8.3 `GET /backup/metrics`
- **Descripción:** Descarga un reporte completo del historial de heartbeats en formato JSON o CSV. Requiere rol `admin`.
- **Query Params:** `format: "json" | "csv"` (def: `"json"`), `from?: string` (ISO-8601), `to?: string` (ISO-8601).
- **Respuesta `200`:** Adjunto de texto (JSON array o líneas CSV).
- **Errores:** `400` (rango de fechas o formato inválido), `401`, `403` (no admin).

---

## 9. Administración de Usuarios y Permisos — `/api/v1/users` *(requieren JWT con rol `admin`)*

### 9.1 `PUT /users/:id/permissions`
- **Descripción:** Modifica el rol y las reglas de visibilidad granulares asignadas a un usuario específico (ej. restringir a ciertos tags o monitores individuales).
- **Request:**
```ts
interface UpdatePermissionsRequest {
  role?: "admin" | "viewer";
  permissions: {
    type: "all" | "group" | "monitor";
    value?: string; // nombre del grupo (Monitor Group) o ID del monitor
  }[];
  isTvSessionEnabled?: boolean; // si es true, prolonga la sesión del usuario a 1 año
}
```
- **Respuesta `200`:** `UserResponse` actualizado.
- **Errores:** `400` (validación), `401` (sin auth), `403` (si el solicitante no es `admin`), `404` (usuario destino no encontrado).

---

## 10. Preferencias de Usuario — `/api/v1/users/preferences` *(requiere JWT)*

### 10.1 `PUT /users/preferences`
- **Descripción:** Actualiza las preferencias visuales del usuario autenticado (ej. activar Nyan Cat Mode).
- **Request:**
```ts
interface UpdatePreferencesRequest {
  nyanCatMode: boolean;
}
```
- **Respuesta `200`:**
```ts
interface UpdatePreferencesResponse {
  success: boolean;
  preferences: {
    nyanCatMode: boolean;
  };
}
```
- **Errores:** `400` (validación), `401` (sin auth).

---

## 11. Gestión de Notificaciones — `/api/v1/notifications` *(requiere JWT con rol `admin`)*

### 11.1 `GET /notifications`
- **Descripción:** Obtiene todos los canales de alerta del usuario.
- **Respuesta `200`:** `INotification[]`.

### 11.2 `POST /notifications`
- **Request:**
```ts
interface CreateNotificationRequest {
  name: string;             // Zod: no vacío, máx 100
  type: "email" | "slack" | "telegram" | "discord" | "webhook";
  config: Record<string, unknown>; // Zod: objeto dependiente del tipo (URLs, credentials)
  isActive?: boolean;       // por defecto true
}
```
- **Respuesta `201`:** `INotification` creado.

### 11.3 `PUT /notifications/:id`
- **Request:** similar a `CreateNotificationRequest` (todos opcionales).
- **Respuesta `200`:** `INotification` actualizado.

### 11.4 `DELETE /notifications/:id`
- **Descripción:** Elimina la notificación.
- **Efecto lateral:** Desvincula la notificación de cualquier monitor que la contenga (remueve su ID del array `notificationIds` en cascada).
- **Respuesta `204`:** sin body.

### 11.5 `POST /notifications/:id/test`
- **Descripción:** Dispara una alerta de prueba ficticia (ej. "Alerta de Prueba Azkin: UP") a través del canal especificado para validar configuraciones.
- **Respuesta `200`:** `{ success: boolean; msg: string }`.
- **Errores:** `400` (error en la llamada de prueba / credenciales incorrectas), `404` (notificación no encontrada).

---

## 12. Trazabilidad de fases (SDD)

| Fase | Entregable | Estado |
|---|---|---|
| 1 — Arquitectura y stack | [`02-arquitectura.md`](02-arquitectura.md) | ✅ Aprobada |
| 2 — Modelado de datos | [`03-modelo-datos.md`](03-modelo-datos.md) | ✅ Aprobada |
| 3 — Contratos de API REST | Este documento | ✅ Aprobada |
| 4 — UI/UX y frontend | Vistas (incluyendo respaldos de configuración y métricas), componentes, estado con Signals | ⏳ Pendiente |
| 5 — Motor de monitoreo | Scheduler, concurrencia, flujo del ping (soportando Cloudflare) | ⏳ Pendiente |
