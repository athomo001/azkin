# Azkin — Visión General y Índice de Especificaciones (SDD)

> **Nota:** Este documento es un resumen ejecutivo. En caso de conflicto, prevalece el documento
> de fase específica (`02`–`05`). Ver [`README.md`](README.md) para el índice completo.

**Azkin** es una plataforma de monitoreo de infraestructura multiusuario, eficiente y sin
sobreingeniería. Metodología: **Spec-Driven Development (SDD)** — no se avanza de fase sin
aprobar la spec correspondiente.

---

## Roles y multiusuario

| Rol | Qué hace |
|---|---|
| **Admin** | Puede ver y modificar todo el sistema: monitores, notificaciones, respaldos y **Viewers**. |
| **Viewer** | Solo lectura. Ve monitores autorizados por permisos granulares. |

- Puede haber **varios Admins** con privilegios globales compartidos y **varios Viewers**.
- `POST /register` crea un **Admin**. Los Viewers los crea un Admin con `POST /users`.
- Permisos granulares del Viewer: `all` | Monitor Group (`group`) | monitor individual.
- Detalle completo: [`03-modelo-datos.md`](03-modelo-datos.md) §2.

---

## Monitor Group vs Tags

| Campo | Propósito |
|---|---|
| **`group`** | Monitor Group jerárquico (ej. `"Netics/Web"`). Agrupa dashboards y define permisos de Viewer. |
| **`tags`** | Etiquetas libres (ej. `["production"]`). Solo filtrado en UI; **no** intervienen en permisos. |

Detalle completo: [`03-modelo-datos.md`](03-modelo-datos.md) §3.

---

## Stack (resumen)

- **Backend:** Node.js + Express + TypeScript estricto · Clean Architecture
- **BD:** MongoDB + Mongoose · Heartbeats como Time Series (TTL 30 días)
- **Planificador:** en memoria (`setTimeout` recursivo + `p-limit`) — sin Redis/BullMQ
- **Tiempo real:** Socket.io · evento `"heartbeat"` · room = Admin propietario (`ownerId`)
- **Frontend:** Angular 19+ Standalone + Signals + Tailwind CSS + ECharts
- **Despliegue:** Docker Compose (mongodb, backend, frontend)

Detalle completo: [`02-arquitectura.md`](02-arquitectura.md).

---

## Fases del proyecto

| Fase | Documento | Estado |
|---|---|---|
| 1 — Arquitectura y stack | [`02-arquitectura.md`](02-arquitectura.md) | ✅ Aprobada |
| 2 — Modelo de datos | [`03-modelo-datos.md`](03-modelo-datos.md) | ✅ Aprobada |
| 3 — Contratos API REST + Socket.io | [`04-contratos-api.md`](04-contratos-api.md) | ✅ Aprobada |
| 4 — UI/UX y frontend | [`06-ui-ux.md`](06-ui-ux.md) | ✅ Aprobada |
| 5 — Motor de monitoreo | [`05-motor-monitoreo.md`](05-motor-monitoreo.md) | ✅ Aprobada |

---

## Referencia rápida de API

Prefijo: `/api/v1/`

| Área | Endpoints clave |
|---|---|
| Auth | `POST /auth/register` (Admin) · `/login` · `/refresh` · `/logout` |
| Monitores | `GET/POST/PUT/DELETE /monitors` |
| Stats | `GET /stats/groups` · `GET /stats/groups/:groupName/overview` |
| Usuarios | `GET/POST/DELETE /users` · `PUT /users/:id/permissions` |
| Notificaciones | `GET/POST/PUT/DELETE /notifications` · `POST /notifications/:id/test` |
| Push (público) | `GET /push/:pushToken` |
| Backup | `GET /backup/export` · `POST /backup/import` |

Contrato completo: [`04-contratos-api.md`](04-contratos-api.md).

---

## Tiempo real (Socket.io)

- Evento: **`heartbeat`** (no `ping_result`).
- Room: ID del **Admin propietario** del monitor.
- Viewer se une a la room de su `adminId` y filtra por permisos en el cliente.

Contrato: [`04-contratos-api.md`](04-contratos-api.md) §13.

---

## Feature core de UI

- **`GroupDashboardView`** (`/dashboard/group/:groupName`): gráfico multilínea por monitor del
  Monitor Group + panel de fallos con mensaje descriptivo (ej. `GLPI - DOWN: 502 Bad Gateway`).
- Solo Admins editan; Viewers ven según permisos.

Detalle visual completo en [`06-ui-ux.md`](06-ui-ux.md).

---

## Restricciones de Código, Comentarios y Aislamiento de Marca

- **Cero referencias directas**: En el código fuente, comentarios, nombres de variables, bases de datos o documentación técnica del sistema no debe existir ninguna referencia directa a sistemas externos de monitoreo analizados previamente.
- **Aislamiento de marca**: Azkin debe ser implementado de manera independiente. Aunque se utilicen conceptos derivados del comportamiento de arquitecturas de referencia, no se debe incluir texto, comentarios, marcas ni fragmentos de código que las mencionen explícitamente.
- **Idioma de comentarios**: El 100 % de los comentarios en el código (backend y frontend) deben estar escritos en **español**.
- **Comentarios descriptivos y de lectura fluida**: Cada función, clase y método complejo debe estar comentado detalladamente para explicar claramente su propósito y lógica de negocio. El objetivo es que al leer secuencialmente el código, se comprenda perfectamente el flujo sin esfuerzo.
