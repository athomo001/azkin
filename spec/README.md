# Azkin — Especificaciones (SDD)

Índice de documentos de especificación. Cada fase debe aprobarse antes de implementar.

| # | Documento | Contenido | Estado |
|---|---|---|---|
| — | [`01-general.md`](01-general.md) | Visión, índice y referencia rápida | Referencia |
| 1 | [`02-arquitectura.md`](02-arquitectura.md) | Stack, capas, puertos, layout del repo | ✅ Aprobada |
| 2 | [`03-modelo-datos.md`](03-modelo-datos.md) | Entidades, schemas, multiusuario, group vs tags | ✅ Aprobada |
| 3 | [`04-contratos-api.md`](04-contratos-api.md) | REST, DTOs, errores, Socket.io §13 | ✅ Aprobada |
| 4 | *(pendiente)* `06-ui-ux.md` | Vistas Angular, componentes, rutas | ⏳ Pendiente |
| 5 | [`05-motor-monitoreo.md`](05-motor-monitoreo.md) | Scheduler, checkers, reintentos, push | ✅ Aprobada |

## Regla de precedencia

En caso de conflicto entre documentos, prevalece el de **fase específica** sobre `01-general.md`.

## Conceptos clave

- **Admin:** alcance global; CRUD de monitores y gestión de Viewers.
- **Viewer:** solo lectura; permisos granulares (`all` | `group` | `monitor`).
- **Monitor Group (`group`):** agrupación jerárquica; usada en dashboards y permisos.
- **Tags (`tags`):** etiquetas libres; solo filtrado UI.
- **Socket.io:** evento `heartbeat`, room = Admin propietario (`ownerId`).
