# Backlog de Issues

Este archivo concentra problemas detectados para resolver en siguientes iteraciones.

## Estado
- [ ] Abierto
- [x] Resuelto

## Indice

### Funcionalidad / bugs reportados

| Codigo | Titulo | Prioridad | Estado |
|---|---|---|---|
| [AZ-001](#az-001-permisos-de-viewers-no-aplican-correctamente-y-pueden-crear-monitores) | Permisos de viewers no aplican correctamente y pueden crear monitores | Alta | [x] Resuelto |
| [AZ-002](#az-002-login-muestra-ayuda-para-crear-administrador-debe-reemplazarse-por-recuperacion-de-contrasena) | Login muestra ayuda para crear administrador; reemplazar por recuperacion de contrasena | Media-Alta | [x] Resuelto |
| [AZ-003](#az-003-implementar-versionamiento-del-sistema) | Implementar versionamiento del sistema | Media | [x] Resuelto |
| [AZ-004](#az-004-admin-debe-poder-configurar-plantillas-de-notificaciones-por-canal-correo-webhook-y-telegram) | Plantillas de notificaciones por canal (correo, webhook, Telegram) | Alta | [x] Resuelto |
| [AZ-005](#az-005-copia-de-seguridad-y-restauracion-reemplazo-de-respaldo-anterior-y-borrado-masivo-de-webs-monitoreadas) | Respaldos: reemplazo de anterior y borrado masivo de webs monitoreadas | Alta | [x] Resuelto |
| [AZ-006](#az-006-configuracion-interna-de-certificados-ssltls-y-puerto-https-configurable) | Certificados SSL/TLS y puerto HTTPS configurable | Alta | [x] Resuelto |
| [AZ-007](#az-007-notificaciones-centralizadas-por-tipo-de-alerta-incluyendo-defacement) | Notificaciones centralizadas por tipo de alerta, incluyendo Defacement | Alta | [x] Resuelto |

### Calidad de codigo / deuda tecnica (auditoria senior)

| Codigo | Titulo | Area | Prioridad | Estado |
|---|---|---|---|---|
| [AZ-008](#az-008-logica-de-autorizacion-por-permisos-duplicada-en-5-lugares-y-rol-sin-tipado-en-el-guard) | Logica de permisos duplicada en 5 lugares + rol sin tipar en el guard | Backend | Alta | [ ] Abierto |
| [AZ-009](#az-009-erosion-de-tipado-any-en-el-borde-http-en-el-puerto-de-jwt-y-en-el-notificador-multicanal) | Erosion de tipado `any` en borde HTTP, puerto JWT y notificador | Backend | Media-Alta | [ ] Abierto |
| [AZ-010](#az-010-endurecimiento-de-seguridad-pendiente-credenciales-por-defecto-cors-abierto-sin-rate-limiting-y-secretos-de-canales-expuestos) | Credenciales por defecto, CORS abierto, sin rate limiting, secretos expuestos | Backend | Alta | [ ] Abierto |
| [AZ-011](#az-011-flujo-de-refresh-token--logout-nunca-completado-codigo-muerto-y-desalineado-con-el-spec-de-autenticacion) | Refresh token / logout nunca completado (codigo muerto) | Backend | Media | [ ] Abierto |
| [AZ-012](#az-012-dato-de-vencimiento-de-dominio-fabricado-se-presenta-un-hash-como-si-fuera-una-consulta-whois-real) | `domainExpiry` fabricado: hash presentado como WHOIS real | Backend | Alta | [ ] Abierto |
| [AZ-013](#az-013-violaciones-de-capas-statscontrollerts-consulta-mongoose-directamente-y-composition-rootts-contiene-logica-de-negocio) | Violaciones de capas: controller consulta Mongoose directo | Backend | Media | [ ] Abierto |
| [AZ-014](#az-014-entidad-monitor-sobrecargada-codigo-de-error-de-cuota-duplicado-y-mapeadores-de-repositorio-repetidos) | Entidad `Monitor` sobrecargada, error de cuota duplicado, mappers repetidos | Backend | Baja | [ ] Abierto |
| [AZ-015](#az-015-cobertura-de-pruebas-casi-nula-en-el-backend-pese-a-una-arquitectura-disenada-para-ser-testeable) | Cobertura de pruebas casi nula en el backend | Backend | Media | [ ] Abierto |
| [AZ-016](#az-016-componentes-dios-en-el-frontend-dashboardts-2300-lineas-y-settingsts-1180-lineas-sin-descomposicion) | Componentes "Dios": `dashboard.ts` (~2300L) y `settings.ts` (~1180L) | Frontend | Media-Alta | [ ] Abierto |
| [AZ-017](#az-017-el-token-de-acceso-se-persiste-en-localstorage-expuesto-a-xss-y-contradice-el-diseno-de-cookie-segura-del-spec) | JWT en `localStorage` (expuesto a XSS), contradice diseno de cookie | Frontend | Alta | [ ] Abierto |
| [AZ-018](#az-018-tipado-any-generalizado-en-los-servicios-core-y-logica-de-normalizacion-de-estado-duplicada-8-veces-con-comportamiento-divergente) | `any` en servicios core + normalizacion de estado duplicada 8 veces | Frontend | Media | [ ] Abierto |
| [AZ-019](#az-019-manejo-de-errores-http-inconsistente-en-el-frontend-3-formatos-distintos-uno-produce-object-object-y-ausencia-total-de-pruebas) | Manejo de errores HTTP inconsistente + cero pruebas unitarias | Frontend | Media | [ ] Abierto |
| [AZ-020](#az-020-manipulacion-directa-del-dom-sin-centralizar-suscripciones-sin-limpieza-formal-e-i18n-sin-tipado-de-claves) | DOM sin centralizar, suscripciones sin limpieza, i18n sin tipado | Frontend | Baja | [ ] Abierto |

---

## AZ-001) Permisos de viewers no aplican correctamente y pueden crear monitores
- Codigo: AZ-001
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-16
- Resuelto: 2026-07-18

### Descripcion
Se configuraron permisos combinados para viewer (grupos, monitores especificos y/o ver todo), pero al iniciar sesion no visualizan informacion.
Adicionalmente, un viewer puede agregar monitores, y eso no debe permitirse: el viewer solo debe poder revisar/consultar.

### Comportamiento esperado
1. Si el viewer tiene permiso `all`, debe ver todo el inventario autorizado por su admin.
2. Si el viewer tiene permisos por `group` o `monitor`, debe ver solo esos recursos.
3. El viewer no debe poder crear, editar, pausar, eliminar ni reconfigurar monitores.
4. El viewer solo puede leer estado, historial y paneles permitidos.

### Criterios de aceptacion
1. Login viewer con `all`: lista y detalle visibles.
2. Login viewer con `group`: solo monitores del grupo autorizado.
3. Login viewer con `monitor`: solo monitores explicitamente autorizados.
4. Endpoints de escritura devuelven 403 para viewer.
5. UI oculta acciones de escritura para viewer (crear/editar/eliminar/pausar).

### Pistas de investigacion
- Verificar filtros de permisos en casos de uso de stats y monitores.
- Revisar middleware de autorizacion por rol para endpoints mutables.
- Alinear permisos backend + ocultamiento de acciones en frontend.

---

## AZ-002) Login muestra ayuda para crear administrador; debe reemplazarse por recuperacion de contrasena
- Codigo: AZ-002
- Estado: [x] Resuelto
- Prioridad: Media-Alta
- Reportado: 2026-07-16
- Resuelto: 2026-07-18

### Descripcion
En la pantalla de login aparece un texto/enlace para crear administradores. En produccion no debe mostrarse ese flujo.
En su lugar, debe existir opcion de recuperacion de contrasena.

### Comportamiento esperado
1. El login no muestra CTA de crear administrador.
2. El login muestra enlace "Recuperar contrasena".
3. Existe flujo de recuperacion (solicitud + validacion + cambio de contrasena).

### Criterios de aceptacion
1. UI login sin enlace de registro admin.
2. UI login con enlace de recuperacion.
3. Endpoint para solicitar recuperacion con respuesta generica (sin filtrar existencia de usuario).
4. Endpoint para restablecer contrasena con token valido y expiracion.
5. Auditoria minima del evento de recuperacion (solicitud y cambio).

### Pistas de investigacion
- Definir si el registro admin queda solo para bootstrap inicial controlado.
- Implementar token temporal firmado/almacenado con expiracion corta.
- Mantener mensajes anti-enumeracion para seguridad.

---

## AZ-003) Implementar versionamiento del sistema
- Codigo: AZ-003
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-16
- Resuelto: 2026-07-18

### Descripcion
Actualmente no existe una estrategia clara para versionar el sistema y sus cambios desplegados.
Se requiere definir e implementar versionado para facilitar trazabilidad, soporte y compatibilidad entre frontend, backend y despliegues.

### Comportamiento esperado
1. El sistema usa una convencion de versionado definida (ej. SemVer).
2. Cada release registra version, fecha y cambios relevantes.
3. Backend expone version actual por endpoint o metadata operativa.
4. Frontend muestra la version de la aplicacion en una zona visible (pie de pagina o pantalla de login).
5. El pipeline/proceso de build permite inyectar o fijar version de forma consistente.

### Criterios de aceptacion
1. Existe documento corto con la politica de versionado (major/minor/patch).
2. Se actualiza version en cada release de forma automatizable o estandarizada.
3. Endpoint de health/info devuelve version ejecutada.
4. UI muestra la misma version que reporta el backend o artefacto de build.
5. `CHANGELOG.md` se mantiene alineado con las versiones publicadas.

### Pistas de investigacion
- Evaluar fuente unica de verdad para version (tag git, package.json o variable de entorno de build).
- Definir convencion de tagging en git (`vX.Y.Z`) y reglas para pre-releases.
- Asegurar que Docker/Compose propaguen version al runtime sin inconsistencias.

---

## AZ-004) Admin debe poder configurar plantillas de notificaciones por canal (correo, webhook y Telegram)
- Codigo: AZ-004
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-16
- Resuelto: 2026-07-18

### Descripcion
Hace falta una configuracion interna para que el admin pueda definir el contenido de las notificaciones por canal.
Debe poder decidir el formato del correo, el payload/texto del webhook y el mensaje de Telegram, con opciones dinamicas segun el evento del monitor (por ejemplo: caida, recuperacion, latencia alta).

### Comportamiento esperado
1. El admin puede configurar plantilla por canal: email, webhook y Telegram.
2. Cada plantilla permite variables dinamicas (ej.: monitor, URL, estado, fecha/hora, codigo HTTP, tiempo de respuesta).
3. Se soportan al menos eventos de `DOWN` (caida) y `RECOVERED` (levantado), y queda preparado para otros eventos.
4. Existe vista previa del mensaje final antes de guardar/enviar prueba.
5. El sistema valida formato minimo por canal (ej. JSON valido para webhook, asunto/cuerpo para email).

### Criterios de aceptacion
1. UI de administracion con seccion de plantillas por canal y por tipo de evento.
2. Guardado y lectura de plantillas persistidas por organizacion/admin.
3. En disparo real de alerta, el mensaje usa la plantilla configurada y reemplaza variables correctamente.
4. Si una variable no existe, se informa error de configuracion sin romper el envio global.
5. Existe accion de "enviar prueba" por canal para validar integraciones y formato.

### Pistas de investigacion
- Definir catalogo oficial de variables dinamicas disponibles por tipo de evento.
- Separar motor de render de plantillas del transporte (email/webhook/telegram).
- Incluir versionado de plantillas para evitar cambios destructivos en caliente.

---

## AZ-005) Copia de seguridad y restauracion: reemplazo de respaldo anterior y borrado masivo de webs monitoreadas
- Codigo: AZ-005
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-16
- Resuelto: 2026-07-18

### Descripcion
En el flujo de respaldos falta una opcion para borrar o reemplazar el respaldo anterior cuando se genera uno nuevo, evitando solape o duplicacion de informacion.
Ademas, se necesita una accion administrativa para borrar de forma masiva webs monitoreadas, con controles de seguridad para evitar eliminaciones accidentales.

### Comportamiento esperado
1. En "Copia de Seguridad y Restauracion" existe opcion para crear nuevo respaldo reemplazando el anterior.
2. El sistema permite elegir entre "acumular respaldos" o "reemplazar ultimo respaldo".
3. Al reemplazar, no quedan datos solapados ni metadatos inconsistentes.
4. Existe opcion de seleccion multiple para borrar masivamente webs monitoreadas.
5. El borrado masivo requiere confirmacion explicita y muestra resumen de impacto antes de ejecutar.

### Criterios de aceptacion
1. UI de respaldos con selector claro de estrategia (acumular/reemplazar).
2. Al generar respaldo en modo reemplazo, el respaldo anterior queda eliminado o archivado segun politica definida.
3. Restauracion valida integridad del respaldo y evita mezcla de estados previos.
4. UI de monitores permite seleccionar multiples webs y eliminarlas en una sola operacion.
5. Endpoint de borrado masivo registra auditoria minima (quien, cuando, cuantos, ids).

### Pistas de investigacion
- Definir politica de retencion de respaldos (ultimo, N ultimos, por fecha).
- Garantizar operacion atomica o transaccional para evitar respaldo parcial/corrupto.
- Implementar "soft delete" opcional para recuperacion rapida ante errores de borrado masivo.

---

## AZ-006) Configuracion interna de certificados SSL/TLS y puerto HTTPS configurable
- Codigo: AZ-006
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-16
- Resuelto: 2026-07-18

### Descripcion
Se requiere una opcion interna para cargar y administrar certificados SSL/TLS, de modo que la plataforma pueda correr de forma segura en HTTPS.
El admin debe poder elegir puerto de escucha (por defecto 443 u otro puerto personalizado) y dejar la configuracion operativa de forma simple, segura y robusta.

### Comportamiento esperado
1. El admin puede cargar certificado, clave privada y cadena intermedia desde UI o configuracion guiada.
2. El sistema permite definir el puerto HTTPS (443 por defecto) o uno personalizado.
3. La validacion de certificados detecta errores de formato, vencimiento y pares clave-certificado invalidos.
4. Al aplicar cambios, el servicio queda operativo sin dejar estados intermedios inseguros.
5. La configuracion incluye buenas practicas de seguridad TLS (protocolos/cifrados permitidos y redireccion opcional de HTTP a HTTPS).

### Criterios de aceptacion
1. Existe flujo de configuracion simple con validaciones y mensajes claros para el admin.
2. La plataforma levanta correctamente en HTTPS en el puerto configurado.
3. Se puede cambiar de puerto sin romper acceso administrativo ni endpoints principales.
4. Si la configuracion es invalida, el sistema revierte al estado estable anterior y reporta el error.
5. Se registran auditorias de cambios de certificados y puertos (quien, cuando, que cambio).

### Pistas de investigacion
- Definir almacenamiento seguro para claves privadas (cifrado en reposo y acceso restringido).
- Evaluar soporte para renovacion de certificados y alertas previas a vencimiento.
- Verificar compatibilidad con Docker/Compose y puertos expuestos para despliegues en distintos entornos.

---

## AZ-007) Notificaciones centralizadas por tipo de alerta, incluyendo Defacement
- Codigo: AZ-007
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-16
- Resuelto: 2026-07-18

### Descripcion
Se necesita centralizar la configuracion de eventos de notificacion para que cada canal pueda recibir todas las alertas o solo tipos especificos.
Adicionalmente, debe contemplarse explicitamente la alerta de Defacement dentro de los eventos configurables.

### Comportamiento esperado
1. Al crear o editar un canal, el admin puede elegir modo "todas las alertas" o "solo alertas seleccionadas".
2. El catalogo de eventos incluye al menos: `DOWN`, `RECOVERED`, `LATENCY_HIGH` y `DEFACEMENT`.
3. La seleccion de eventos se gestiona en un unico punto centralizado de configuracion.
4. El sistema permite combinar canales con estrategias distintas (ej.: Telegram todo, email solo Defacement y caidas).
5. El disparo de notificaciones respeta exactamente la seleccion de eventos definida por canal.

### Criterios de aceptacion
1. UI muestra selector claro de alcance: todas vs eventos especificos.
2. Existe selector multiple de eventos con `DEFACEMENT` disponible.
3. Guardado y carga de la configuracion mantienen consistencia sin perder eventos seleccionados.
4. Pruebas funcionales verifican que una alerta de Defacement se envia solo a los canales habilitados para ese evento.
5. Existe vista/resumen central que permita auditar rapido que eventos envia cada canal.

### Pistas de investigacion
- Definir enum unico de eventos de alerta compartido entre backend y frontend.
- Evitar duplicidad entre configuracion de plantillas (contenido) y configuracion de enrutamiento (eventos).
- Considerar migracion de canales existentes a un valor por defecto seguro (por ejemplo, "todas las alertas").

---

## AZ-008) Logica de autorizacion por permisos duplicada en 5 lugares y rol sin tipado en el guard
- Codigo: AZ-008
- Estado: [ ] Abierto
- Prioridad: Alta
- Reportado: 2026-07-18

### Descripcion
El algoritmo "resolver ownerId segun rol y filtrar monitores por permisos granulares (`all`/`group`/`monitor`)" esta copiado casi byte a byte en 5 lugares distintos: `list-monitors.usecase.ts`, `get-groups.usecase.ts`, `get-group-overview.usecase.ts`, `get-history.usecase.ts` y, el mas grave, inline dentro de `stats.controller.ts` (metodo `recentEvents`, capa HTTP en vez de un caso de uso). Es la logica de aislamiento de datos mas sensible de todo el sistema (evita que un Viewer vea monitores ajenos) y no tiene ni una sola prueba dedicada a su propio comportamiento (las pruebas actuales de AZ-001 cubren el bug del JWT, no el algoritmo de filtrado en si).
Adicionalmente, `requireRole(...allowedRoles: string[])` (`infrastructure/http/middlewares/require-role.ts`) acepta `string[]` en vez de `UserRole[]`, y no existe un objeto `Role`/enum en tiempo de ejecucion (`domain/entities/user.ts` solo declara el tipo `UserRole` a nivel de compilacion) — un typo como `requireRole("admn")` compila sin error y bloquea silenciosamente a todos los admins en runtime.

### Comportamiento esperado
1. Existe una unica fuente de verdad (servicio de dominio/aplicacion, ej. `MonitorAccessPolicy`) para resolver `ownerId` y filtrar por permisos, usada por los 4 casos de uso y por `stats.controller.ts`.
2. `stats.controller.ts:recentEvents` deja de consultar Mongoose/heartbeats directamente y pasa por un caso de uso propio (`GetRecentEventsUseCase`) que reutiliza esa politica de acceso.
3. Los roles se referencian mediante un `Role`/const compartido (`Role.ADMIN`/`Role.VIEWER`), nunca como string literal suelto.
4. `requireRole` exige `UserRole[]` en su firma, de modo que un typo en el nombre del rol sea un error de compilacion.

### Criterios de aceptacion
1. Pruebas unitarias del helper de politica de acceso cubren los 3 tipos de permiso (`all`/`group`/`monitor`) y el caso admin (sin filtro).
2. Los 5 puntos de uso (incluyendo `recentEvents`) delegan en el mismo helper; no queda logica de filtrado duplicada.
3. `requireRole("admn")` (o cualquier string que no sea `"admin"|"viewer"`) falla en tiempo de compilacion.
4. `stats.controller.ts` ya no importa `mongoose`/`HeartbeatModel` directamente ni usa `require()` dentro de un metodo.

### Pistas de investigacion
- Revisar `backend/src/application/use-cases/monitors/list-monitors.usecase.ts`, `stats/get-groups.usecase.ts`, `stats/get-group-overview.usecase.ts`, `stats/get-history.usecase.ts` y `infrastructure/http/controllers/stats.controller.ts` (metodo `recentEvents`, lineas ~68-120) para extraer el patron comun.
- `infrastructure/http/middlewares/require-role.ts` — cambiar la firma para aceptar `UserRole[]`.
- Anadir `IHeartbeatRepository.findLastEventsForMonitors(monitorIds, limit)` para eliminar el acceso directo a Mongoose desde el controller.

---

## AZ-009) Erosion de tipado (`any`) en el borde HTTP, en el puerto de JWT y en el notificador multicanal
- Codigo: AZ-009
- Estado: [ ] Abierto
- Prioridad: Media-Alta
- Reportado: 2026-07-18

### Descripcion
Pese a que el proyecto declara `strict: true` y presume Clean Architecture, hay 37 usos de `: any`/`as any` en el backend concentrados en puntos criticos: el puerto `ITokenService` tipa `permissions?: any[]` en el payload del JWT (existiendo ya `IUserPermission` en el dominio), `multichannel-notifier.ts` hace `config.config as any` en cada canal (5 veces) por falta de un tipo discriminado por `NotificationType`, `mongoose-monitor.repository.ts` usa `const updateObj: any = { ...data }` anulando el tipado de `UpdateMonitorData`, y los controladores usan `req.userId!`/`req.adminId!`/`req.userRole!`/`req.permissions!` de forma masiva (12 veces solo en `stats.controller.ts`) en vez de un tipo `AuthenticatedRequest` que garantice esos campos sin non-null assertions.

### Comportamiento esperado
1. El payload del JWT esta tipado con `IUserPermission[]`, no `any[]`.
2. `INotification.config` es un tipo discriminado por canal (`SlackConfig | DiscordConfig | TelegramConfig | WebhookConfig | EmailConfig`), no `Record<string, unknown>` con casts `as any` en cada sender.
3. Los controladores reciben un `Request` extendido (`AuthenticatedRequest`) con `userId`/`userRole`/`adminId`/`permissions` no-opcionales despues de `authGuard`, eliminando los `!`.
4. Ninguna operacion de actualizacion de repositorio usa `any` para el payload de `$set`.

### Criterios de aceptacion
1. `tsc --noEmit` sigue pasando tras introducir los tipos mas estrictos (sin regresiones).
2. Cero apariciones de `any[]` en `application/ports/services/security.ts` y `infrastructure/security/jwt-token-service.ts`.
3. `multichannel-notifier.ts` no contiene `as any` en ninguno de sus metodos `sendX`.
4. Los controladores HTTP ya no requieren `!` para acceder a `req.userId`/`req.adminId`/`req.userRole`/`req.permissions`.

### Pistas de investigacion
- `backend/src/application/ports/services/security.ts` y `infrastructure/security/jwt-token-service.ts`.
- `backend/src/domain/entities/notification.ts` (campo `config`) y `infrastructure/notifier/multichannel-notifier.ts` (metodos `sendSlack`/`sendDiscord`/`sendTelegram`/`sendWebhook`/`sendEmail`).
- `infrastructure/persistence/mongoose/repositories/mongoose-monitor.repository.ts` (metodo `update`).
- Definir `AuthenticatedRequest extends Request` en `types/express.d.ts` y usarlo como tipo de los handlers en vez de `Request` + `!`.

---

## AZ-010) Endurecimiento de seguridad pendiente: credenciales por defecto, CORS abierto, sin rate limiting y secretos de canales expuestos
- Codigo: AZ-010
- Estado: [ ] Abierto
- Prioridad: Alta
- Reportado: 2026-07-18

### Descripcion
Se detectaron varios puntos de seguridad "por defecto insegura":
1. `composition-root.ts` define credenciales por defecto en codigo para Basic Auth de `/metrics` (`prom_scraper` / `PrometheusScraperSecurePass123!`) si no se configuran variables de entorno, con comparacion de string no constante en tiempo (no `crypto.timingSafeEqual`) y permite pasar la API key por query string (queda en logs de acceso/proxy).
2. `AZKIN_CORS_ORIGIN` por defecto es `"*"` (`env.ts`), aplicado tanto a Express/cors como a Socket.io.
3. No existe rate limiting en `/api/v1/auth/register`, `/login`, `/forgot-password` ni `/reset-password` — expuestos a fuerza bruta y enumeracion de tokens/emails.
4. El costo de bcrypt esta fijo en 10 en el constructor de `BcryptPasswordHasher`, sin override por entorno.
5. `GET/POST/PUT /notifications` devuelven el campo `config` completo (URLs de webhook, tokens de bot, credenciales SMTP) sin ningun enmascarado, a diferencia de `passwordHash` que nunca sale del dominio.

### Comportamiento esperado
1. `/metrics` no arranca (o rechaza todo trafico) si no hay credencial configurada explicitamente; sin fallback hardcodeado.
2. La comparacion de credenciales de `/metrics` usa comparacion en tiempo constante.
3. `AZKIN_CORS_ORIGIN` no tiene un default permisivo; se exige configuracion explicita (o el default es deny-all con warning de arranque).
4. Existe rate limiting por IP/identificador en los 4 endpoints de autenticacion mencionados.
5. El costo de bcrypt es configurable via entorno.
6. Las respuestas de `/notifications` enmascaran campos sensibles del `config` (ej. mostrar solo los ultimos caracteres de un token, u omitir el valor y devolver solo si esta configurado).

### Criterios de aceptacion
1. Arrancar el backend sin `AZKIN_PROMETHEUS_PASS`/`AZKIN_PROMETHEUS_API_KEY` no deja `/metrics` accesible con una contrasena conocida de antemano en el codigo fuente.
2. Un test de integracion confirma que 6 intentos de login fallidos consecutivos desde la misma IP son bloqueados/throttled.
3. `GET /notifications` en un test no devuelve el valor en texto plano de `config.smtpPassword`/`config.botToken`/`config.webhookUrl` (o los redacta).
4. Documentacion (`README`/`.env.example`) explica el nuevo comportamiento de CORS y rate limiting.

### Pistas de investigacion
- `backend/src/composition-root.ts` lineas ~235-329 (bloque `/metrics`).
- `backend/src/infrastructure/config/env.ts` (`AZKIN_CORS_ORIGIN`).
- Evaluar `express-rate-limit` (en memoria) o un limitador respaldado por Mongo/Redis si se requiere multi-instancia.
- `backend/src/infrastructure/security/bcrypt-password-hasher.ts` y su instanciacion en `composition-root.ts`.
- Presenter/mapper para `INotification` en `notification.controller.ts` que enmascare `config` antes de serializar.

---

## AZ-011) Flujo de refresh token / logout nunca completado (codigo muerto) y desalineado con el spec de autenticacion
- Codigo: AZ-011
- Estado: [ ] Abierto
- Prioridad: Media
- Reportado: 2026-07-18

### Descripcion
`spec/04-contratos-api.md` documenta un flujo de `POST /refresh` y `POST /logout` basado en cookie `HttpOnly` de refresh token de 7 dias y access token de 15 minutos. En la implementacion real: `refresh.usecase.ts` y `logout.usecase.ts` existen pero **nunca se conectan a ninguna ruta** (no hay `router.post("/refresh", ...)` ni `/logout` en `auth.routes.ts`, ni se instancian en `composition-root.ts`); `logout.usecase.ts` ademas es un no-op vacio. No existe `cookie-parser` ni ningun `res.cookie(...)` en todo el backend — el login solo devuelve un JWT en el body (bearer token puro). El `AZKIN_JWT_EXPIRES_IN` por defecto es 7200s (2h), no los 15 minutos que documenta el spec. Resultado: no hay ninguna forma de revocar una sesion (no hay logout real), y un token filtrado sigue siendo valido hasta su expiracion completa.

### Comportamiento esperado
1. Se decide explicitamente una de dos rutas: (a) completar el flujo de cookie+refresh+logout descrito en el spec, o (b) actualizar el spec para reflejar que el sistema es bearer-token-only y documentar como se maneja la revocacion (si la hay).
2. Si se opta por (a): `POST /refresh` y `POST /logout` quedan montados y funcionales, con cookie `HttpOnly`/`Secure`/`SameSite` para el refresh token.
3. El tiempo de expiracion del access token en codigo coincide con lo que documenta el spec (o el spec se corrige para reflejar el valor real).
4. No queda codigo muerto: `refresh.usecase.ts`/`logout.usecase.ts` estan conectados o se eliminan.

### Criterios de aceptacion
1. `grep` por `"/refresh"` y `"/logout"` en `infrastructure/http/routes/` encuentra rutas montadas y probadas, o esos casos de uso ya no existen en el arbol de codigo.
2. Un test de integracion confirma que tras `logout`, un token previamente valido deja de servir para acceder a un endpoint protegido (si se implementa revocacion) — o el spec dice explicitamente que no hay revocacion server-side y por que.
3. `spec/04-contratos-api.md` §1.1/§4 coincide con el comportamiento real (tiempos de expiracion, existencia o no de cookies).

### Pistas de investigacion
- `backend/src/application/use-cases/auth/refresh.usecase.ts`, `logout.usecase.ts`, `infrastructure/http/routes/auth.routes.ts`, `composition-root.ts`.
- Si se implementa revocacion real, evaluar una lista de tokens invalidados (o de refresh tokens activos) persistida en Mongo con TTL, ya que el JWT en si es stateless.

---

## AZ-012) Dato de vencimiento de dominio fabricado: se presenta un hash como si fuera una consulta WHOIS real
- Codigo: AZ-012
- Estado: [ ] Abierto
- Prioridad: Alta
- Reportado: 2026-07-18

### Descripcion
En `infrastructure/checkers/http.checker.ts` el campo `domainExpiry` que se muestra al usuario (dashboard, tarjeta de monitor HTTP) **no es una consulta real de expiracion de dominio**: se calcula con un hash deterministico del hostname (`hash = hostname.charCodeAt(i) + ((hash << 5) - hash)` ... `Math.abs(hash % 240) + 30`), comentado explicitamente como una forma de "dar una experiencia visual fluida e identica a WHOIS sin bloqueos por IP". El resultado es un numero de dias "hasta vencimiento" que no tiene relacion alguna con la fecha real de expiracion del dominio, pero se presenta en la UI con la misma apariencia que un dato real, pudiendo inducir a un operador a confiar en una fecha de vencimiento de dominio falsa (ej. renovar tarde un dominio que "segun Azkin" vencia en 200 dias).

### Comportamiento esperado
1. `domainExpiry` refleja una consulta real (WHOIS/RDAP) del dominio, o el campo se elimina/oculta si no hay una fuente de datos real disponible.
2. Si se mantiene una limitacion tecnica (rate limiting de WHOIS, bloqueos por IP), la UI indica explicitamente "no disponible" en vez de mostrar un numero fabricado.
3. Ningun dato mostrado al usuario como "vencimiento" o "expiracion" se genera a partir de una funcion determinista sin relacion con la realidad.

### Criterios de aceptacion
1. Se elimina el bloque de hash-fabricado en `http.checker.ts` (o se reemplaza por una llamada RDAP/WHOIS real con cache y manejo de fallos).
2. Si no hay dato real disponible, `domainExpiry` es `null` y el frontend muestra "N/D"/"no disponible" en vez de un numero.
3. Se documenta en el spec de que fuente proviene el dato de expiracion de dominio.

### Pistas de investigacion
- `backend/src/infrastructure/checkers/http.checker.ts` (buscar el comentario "Calculo deterministico de la expiracion de dominio").
- Evaluar libreria RDAP/WHOIS ligera, con cache (Mongo o in-memory con TTL) para no golpear servidores WHOIS en cada check.
- Revisar tambien `certExpiry` en el mismo archivo para confirmar si es un dato real (TLS) o si sufre el mismo problema.

---

## AZ-013) Violaciones de capas: `stats.controller.ts` consulta Mongoose directamente y `composition-root.ts` contiene logica de negocio
- Codigo: AZ-013
- Estado: [ ] Abierto
- Prioridad: Media
- Reportado: 2026-07-18

### Descripcion
`stats.controller.ts` (metodo `recentEvents`) hace `require("mongoose")` y `require(".../heartbeat.schema")` **dentro del metodo del controlador**, consultando `HeartbeatModel` directamente y duplicando el filtro de permisos (ver AZ-008), sin pasar por `IHeartbeatRepository` ni por un caso de uso — rompe la regla de dependencia de Clean Architecture y hace este endpoint imposible de testear sin una conexion Mongo real.
Por separado, `composition-root.ts` (que deberia limitarse a cablear dependencias) contiene ~95 lineas de logica de negocio y presentacion: el generador completo del endpoint `/metrics` de Prometheus (autenticacion, consulta a Mongo via `.lean()`, construccion de texto con formato Prometheus), leyendo `process.env` directamente en vez de usar el objeto `env` validado que usa el resto del sistema.

### Comportamiento esperado
1. `stats.controller.ts` no importa Mongoose ni modelos de persistencia; usa `IHeartbeatRepository`/un caso de uso dedicado.
2. `composition-root.ts` solo instancia y cablea dependencias; la logica de `/metrics` vive en un `MetricsController`/`GetMetricsUseCase` propios.
3. La configuracion de `/metrics` (usuario/password/api key) se lee del objeto `env` validado por Zod, no de `process.env` directamente.

### Criterios de aceptacion
1. `grep -r "require(" backend/src/infrastructure/http/controllers` no devuelve resultados.
2. `composition-root.ts` baja de ~343 a un tamano centrado solo en wiring (referencia: <150 lineas).
3. Existe un test para el nuevo `GetRecentEventsUseCase`/`GetMetricsUseCase` que no requiere una conexion Mongo real (usa un repositorio fake).

### Pistas de investigacion
- `backend/src/infrastructure/http/controllers/stats.controller.ts` (metodo `recentEvents`, ~lineas 68-120).
- `backend/src/composition-root.ts` (~lineas 235-329, bloque `/metrics`).
- Anadir `AZKIN_PROMETHEUS_USER`/`AZKIN_PROMETHEUS_PASS`/`AZKIN_PROMETHEUS_API_KEY` a `env.ts` (hoy solo se leen via `process.env` inline).

---

## AZ-014) Entidad `Monitor` sobrecargada, codigo de error de cuota duplicado y mapeadores de repositorio repetidos
- Codigo: AZ-014
- Estado: [ ] Abierto
- Prioridad: Baja
- Reportado: 2026-07-18

### Descripcion
Varias deudas tecnicas menores mas, todas de calidad/mantenibilidad (no bugs criticos):
1. `IMonitor` (`domain/entities/monitor.ts`) es una interfaz plana con ~40 campos opcionales mezclando HTTP, DNS, 9 campos SNMP (v1/v2c/v3), push y 6 campos de "integridad visual" (defacement), sin ninguna relacion tipada entre `type` y los campos que realmente aplican.
2. `QuotaExceededError` (`domain/errors/domain-error.ts`) reutiliza el mismo `code = "VALIDATION_ERROR"` que `ValidationError`, impidiendo que el frontend distinga "campo invalido" de "cuota de 50 monitores superada" mirando solo el `code`.
3. Cada repositorio Mongoose (`monitor`, `notification`, `user`, `backup`, `audit-log`, `tls-config`) reimplementa a mano un metodo `toDomain(doc)` casi identico (conversion de `ObjectId` a string, etc.) sin ningun helper/base compartido.
4. Manejo de errores inconsistente: decenas de `catch (error: any)` que acceden a `.message` directamente en checkers/notifier/casos de uso, en vez de un helper `getErrorMessage(err: unknown): string` que respete `strict`.
5. Algunos puntos usan `console.warn`/`console.info`/`console.error` directamente (`execute-check.usecase.ts`, `seed-first-admin.ts`, `env.ts`) en vez del `logger` centralizado usado en el resto del sistema.

### Comportamiento esperado
1. `IMonitor` se modela como union discriminada por `type` (o al menos agrupa SNMP/DNS/integrity en sub-objetos anidados).
2. `QuotaExceededError` tiene su propio `code` (ej. `QUOTA_EXCEEDED`).
3. Existe un helper generico de mapeo Mongoose→dominio reutilizado por los 6 repositorios.
4. Existe un helper `getErrorMessage(err: unknown): string` usado consistentemente.
5. Todos los `console.*` de la capa de aplicacion/infraestructura pasan a usar `logger`.

### Criterios de aceptacion
1. El codigo de error de cuota es distinguible en el frontend sin parsear el mensaje.
2. Los 6 repositorios comparten el helper/base de mapeo (reduccion medible de lineas duplicadas).
3. `grep -rn "console\." backend/src` solo devuelve resultados dentro de `infrastructure/logger.ts` (y el arranque temprano de `env.ts` si se decide dejarlo ahi por orden de inicializacion).

### Pistas de investigacion
- `backend/src/domain/entities/monitor.ts`, `domain/errors/domain-error.ts`.
- `infrastructure/persistence/mongoose/repositories/*.ts` (6 archivos).
- `infrastructure/checkers/*.ts`, `infrastructure/notifier/*.ts`, `application/use-cases/**/*.usecase.ts` (buscar `catch (e: any)` / `catch (error: any)`).
- Priorizar el punto 2 (codigo de error) por ser el mas barato de corregir con mayor impacto en el frontend.

---

## AZ-015) Cobertura de pruebas casi nula en el backend pese a una arquitectura disenada para ser testeable
- Codigo: AZ-015
- Estado: [ ] Abierto
- Prioridad: Media
- Reportado: 2026-07-18

### Descripcion
`spec/02-arquitectura.md` §7 prescribe una piramide de testing (unit de dominio/casos de uso sin I/O, integracion de repositorios, E2E de API y UI). En la practica: de 30 archivos `*.usecase.ts`, solo 5 tienen test (`login`, `register`, `request-password-reset`, `bulk-delete-monitors`, `apply-tls-config` — todos anadidos en esta misma iteracion de AZ-001 a AZ-006). Los 7 controladores HTTP y los 7 repositorios Mongoose tienen 0 pruebas. En particular, la logica de filtrado de permisos de Viewer descrita en AZ-008 —el mecanismo de aislamiento de datos mas sensible del sistema— no tiene ninguna prueba dedicada a su propio comportamiento.

### Comportamiento esperado
1. Los casos de uso de mayor riesgo (filtrado de permisos, creacion/actualizacion/borrado de monitores, importacion de respaldos, aplicacion de config TLS) tienen pruebas unitarias con repositorios fake.
2. Existe al menos una prueba de integracion de repositorio Mongoose (ej. con `mongodb-memory-server`) que valide el mapeo documento↔dominio.
3. Se establece un umbral minimo de cobertura (ej. via `c8`/`nyc`) que corra en CI si existe pipeline.

### Criterios de aceptacion
1. Los 4 casos de uso de permisos (`list-monitors`, `get-groups`, `get-group-overview`, `get-history`) tienen prueba unitaria (una vez resuelto AZ-008, basta con testear el helper compartido).
2. Al menos un repositorio Mongoose tiene prueba de integracion real contra una instancia Mongo efimera.
3. `pnpm test` reporta la cobertura resultante y el numero crece de forma medible respecto al estado actual (15 tests).

### Pistas de investigacion
- Priorizar primero el helper de AZ-008 (mayor riesgo, menor esfuerzo de testear una vez extraido).
- Evaluar `mongodb-memory-server` para pruebas de integracion de repositorios sin depender de una instancia Mongo externa.
- El harness ya usa `node --test` + `tsx` (ver `backend/package.json` script `test`); mantener esa base en vez de introducir un runner nuevo.

---

## AZ-016) Componentes "Dios" en el frontend: `dashboard.ts` (~2300 lineas) y `settings.ts` (~1180 lineas) sin descomposicion
- Codigo: AZ-016
- Estado: [ ] Abierto
- Prioridad: Media-Alta
- Reportado: 2026-07-18

### Descripcion
`frontend/src/app/features/dashboard/dashboard.ts` tiene ~2322 lineas (plantilla inline de ~990 lineas + ~1290 lineas de logica: CRUD de monitores, renderizado de ECharts, manejo de heartbeats por Socket.io, filtrado de historial, calculo de bloques de uptime, borrado masivo, tema/nyan-cat, i18n, agregacion de grupos — todo en una sola clase). `settings.ts` tiene ~1184 lineas mezclando 5 dominios funcionales no relacionados (canales de alerta, viewers, perfil, respaldos, TLS) en un solo componente. No existen subcomponentes extraidos pese a que el proyecto ya tiene un patron establecido en `shared/components` (`badge-status.ts`, `skeleton-loader.ts`). `group-dashboard.ts` (137 lineas) demuestra que el mismo dominio (graficos de grupo) puede resolverse en un componente pequeno y enfocado.

### Comportamiento esperado
1. `dashboard.ts` se descompone en subcomponentes presentacionales (ej. `MonitorListComponent`, `MonitorDetailPanel`, `MonitorFormModal`, `MonitorChart`, `BulkActionsBar`) comunicados via `input()`/`output()`/signals.
2. `settings.ts` se descompone por pestana/dominio (`AlertsPanelComponent`, `ViewersPanelComponent`, `ProfilePanelComponent`, `BackupsPanelComponent`, `TlsPanelComponent`).
3. Cada subcomponente cabe holgadamente en una sola pantalla de revision de codigo (referencia orientativa: <400 lineas).

### Criterios de aceptacion
1. `dashboard.ts` y `settings.ts` (los archivos "orquestadores") quedan por debajo de ~400-500 lineas cada uno.
2. Cada subcomponente extraido es importable/testeable de forma aislada.
3. La build de Angular (`ng build`) sigue pasando sin regresiones visuales tras la extraccion (verificar manualmente el dashboard y settings en el navegador).

### Pistas de investigacion
- `frontend/src/app/features/dashboard/dashboard.ts` y `frontend/src/app/features/settings/settings.ts`.
- Empezar por el dominio mas aislado de cada archivo (ej. `BulkActionsBar` en dashboard, `TlsPanelComponent` en settings) para validar el patron antes de migrar el resto.
- Aprovechar la extraccion para anadir las primeras pruebas unitarias (ver AZ-019) a los subcomponentes nuevos.

---

## AZ-017) El token de acceso se persiste en `localStorage` (expuesto a XSS) y contradice el diseno de cookie segura del spec
- Codigo: AZ-017
- Estado: [ ] Abierto
- Prioridad: Alta
- Reportado: 2026-07-18

### Descripcion
`auth.service.ts` guarda el JWT de acceso en `localStorage` (`azkin_token`) en cada login y lo rehidrata desde ahi al arrancar la app, pese a que el campo en memoria se llama `accessToken` y un comentario dice "se almacena en memoria". `spec/04-contratos-api.md` describe el diseno previsto como cookie `HttpOnly` para el refresh token (no accesible por JS), pero la implementacion actual persiste el propio access token en un storage legible por cualquier script (XSS, dependencia de terceros comprometida, etc. podria exfiltrar la sesion). Ademas, `realtime.service.ts` reenvia ese mismo token en el query string del handshake de Socket.io, quedando potencialmente en logs de acceso/proxy.

### Comportamiento esperado
1. El access token vive solo en memoria (signal/variable de servicio), nunca en `localStorage`/`sessionStorage`.
2. La renovacion de sesion tras recargar la pagina se resuelve llamando a `POST /auth/refresh` (una vez resuelto AZ-011) en vez de leer un token persistido en el cliente.
3. El token para Socket.io se envia solo via el objeto `auth` del handshake, no tambien duplicado en `query`.

### Criterios de aceptacion
1. `grep -rn "localStorage" frontend/src/app/core/services/auth.service.ts` no devuelve escrituras/lecturas del token de sesion.
2. Recargar la pagina con una sesion activa sigue autenticando al usuario (via refresh silencioso), sin requerir un nuevo login manual.
3. El handshake de Socket.io ya no incluye el token en `query`.

### Pistas de investigacion
- `frontend/src/app/core/services/auth.service.ts` (constructor y metodo `login`).
- `frontend/src/app/core/services/realtime.service.ts` (linea del `query: { token }`).
- Depende de AZ-011 (flujo de refresh/cookie) para completarse correctamente; si AZ-011 se resuelve manteniendo bearer-token puro, este issue debe re-evaluarse (el mitigante minimo sin cookies es al menos dejar de duplicar el token en `query` de Socket.io).

---

## AZ-018) Tipado `any` generalizado en los servicios core y logica de normalizacion de estado duplicada 8 veces con comportamiento divergente
- Codigo: AZ-018
- Estado: [ ] Abierto
- Prioridad: Media
- Reportado: 2026-07-18

### Descripcion
`monitor.service.ts` tipa como `any`/`Observable<any>` la mayoria de sus respuestas HTTP (`loadMonitors`, `getHistory`, `getGroupOverview`, `create`, `update`, `applyHeartbeat`) pese a que ya existe una interfaz `IMonitor` bien tipada en el mismo archivo — el DTO de red simplemente se salta con `any` y se hace spread directo (`...m`, `...created`, `...updated`) sobre el objeto de dominio. El mismo patron de normalizacion de `lastStatus` (`if (ls === 1 || ls === 'UP') statusStr = 'UP'; else if...`) esta copiado 8 veces entre `monitor.service.ts` y `dashboard.ts`, y **ya diverge**: las variantes de `create()`/`update()` omiten la rama explicita de `PENDING` que si tienen `loadMonitors()`/`applyHeartbeat()`, funcionando hoy solo porque el valor por defecto coincide por casualidad.

### Comportamiento esperado
1. Existe una unica funcion pura `normalizeMonitorStatus(raw): 'UP' | 'DOWN' | 'PENDING'` reutilizada en las 8 ubicaciones.
2. Los metodos HTTP de `monitor.service.ts` usan interfaces DTO tipadas (`MonitorDto`, `HeartbeatResponseDto`) en vez de `any`.
3. `auth.service.ts` reemplaza sus `Observable<any>` (`register`, `login`, `refresh`, `logout`) por tipos de respuesta concretos.

### Criterios de aceptacion
1. `grep -rn ": any" frontend/src/app/core/services/monitor.service.ts` no devuelve resultados tras la refactorizacion.
2. Una sola implementacion de `normalizeMonitorStatus` es importada en los 8 puntos identificados (no queda logica duplicada).
3. Un test unitario de `normalizeMonitorStatus` cubre explicitamente los valores `0/1/2` y `'UP'/'DOWN'/'PENDING'` como entrada.

### Pistas de investigacion
- `frontend/src/app/core/services/monitor.service.ts` (metodos `loadMonitors`, `create`, `update`, `applyHeartbeat`).
- `frontend/src/app/features/dashboard/dashboard.ts` (buscar las 4 repeticiones adicionales del mismo chequeo).
- `frontend/src/app/core/services/auth.service.ts` y `realtime.service.ts` (tipado de payloads de Socket.io).

---

## AZ-019) Manejo de errores HTTP inconsistente en el frontend (3 formatos distintos, uno produce "[object Object]") y ausencia total de pruebas
- Codigo: AZ-019
- Estado: [ ] Abierto
- Prioridad: Media
- Reportado: 2026-07-18

### Descripcion
La extraccion del mensaje de error de las respuestas HTTP fallidas usa tres formas incompatibles segun el archivo: `err?.error?.message` (`register.ts`), `err?.error?.error?.message` (mayoria de los casos: `reset-password.ts`, `dashboard.ts`, varios puntos de `settings.ts`) y `err?.error?.error` sin `.message` (dos puntos de `settings.ts`, cambio de contrasena) — esta ultima variante, si el backend responde con el envelope real `{ error: { message } }`, termina mostrando el string `"[object Object]"` en el toast en vez del mensaje real. Por separado, no existe ni un solo archivo `*.spec.ts` en todo `frontend/src/app` (Angular CLI nunca genero specs, o fueron eliminados), por lo que no hay cobertura de pruebas de ningun servicio o componente.

### Comportamiento esperado
1. Existe una unica funcion `extractApiErrorMessage(err, fallback)` usada en todos los `error:` callbacks del frontend, alineada al envelope real del backend (`{ error: { code, message, details? } }`).
2. Se anaden pruebas unitarias (Karma/Jasmine o el runner que se decida) al menos para `monitor.service.ts` y `auth.service.ts`.

### Criterios de aceptacion
1. `grep -rn "err?.error?.error" frontend/src/app` muestra un unico patron consistente (o se elimina en favor del helper centralizado).
2. Se reproduce y corrige el bug concreto de `"[object Object]"` en el cambio de contrasena de `settings.ts`.
3. `ng test` encuentra y ejecuta al menos un archivo `*.spec.ts` (deja de reportar "no specs found").

### Pistas de investigacion
- `frontend/src/app/features/settings/settings.ts` (lineas con `err?.error?.error ||`, sin `.message` — cambio de contrasena propio y de viewer).
- `frontend/src/app/features/auth/register.ts`, `reset-password.ts`, `dashboard.ts` para el resto de variantes.
- Confirmar primero cual es el envelope real devuelto por `errorHandler` en el backend (`{ error: { code, message, details } }`) antes de fijar el helper.

---

## AZ-020) Manipulacion directa del DOM sin centralizar, suscripciones sin limpieza formal e i18n sin tipado de claves
- Codigo: AZ-020
- Estado: [ ] Abierto
- Prioridad: Baja
- Reportado: 2026-07-18

### Descripcion
Varios puntos menores de higiene en el frontend:
1. `settings.ts` maneja descarga de archivos (`Blob`/`URL.createObjectURL`/`document.createElement('a')`) y `dashboard.ts` usa `document.body.classList`/`(document as any).startViewTransition` directamente dentro de los componentes, sin un servicio compartido (`FileDownloadService`/`ThemeService`) ni guardas de entorno (SSR-safety).
2. `dashboard.ts` registra un callback con `realtimeService.onHeartbeat(...)` ignorando la funcion de desuscripcion que el metodo devuelve explicitamente; hoy "funciona" solo porque `RealtimeService` es un singleton con un unico consumidor y `ngOnDestroy` llama a `disconnect()`, que limpia todos los callbacks como efecto secundario — fragil ante un segundo consumidor futuro. Ninguna de las 12 llamadas `.subscribe(...)` de `dashboard.ts` usa `takeUntilDestroyed()`.
3. `language.service.ts` reconstruye un objeto literal de ~152 claves de traduccion **en cada llamada** a `t(key)` (dentro del propio metodo), sin tipado de claves (un typo en la clave devuelve silenciosamente la clave cruda en vez de fallar).

### Comportamiento esperado
1. Existe un `FileDownloadService`/util compartido y un `ThemeService` que centralizan el acceso a `document`/`Blob`/`URL`.
2. Las suscripciones de larga duracion en `dashboard.ts` usan `takeUntilDestroyed(this.destroyRef)` o almacenan y limpian explicitamente su `Subscription`/funcion de desuscripcion en `ngOnDestroy`.
3. El diccionario de `language.service.ts` se construye una sola vez a nivel de modulo (no dentro de `t()`), y las claves tienen un tipo derivado (`keyof typeof TRANSLATIONS`) para deteccion de typos en tiempo de compilacion.

### Criterios de aceptacion
1. `ThemeService`/`FileDownloadService` existen y son usados por `dashboard.ts`/`settings.ts` en vez de acceso directo a `document`/`Blob`/`URL`.
2. El callback de `onHeartbeat` en `dashboard.ts` se desuscribe explicitamente en `ngOnDestroy` (no depende del efecto secundario de `disconnect()`).
3. `lang.t('clave.que.no.existe')` produce un error de compilacion (no un string silencioso en runtime) tras tipar las claves.

### Pistas de investigacion
- `frontend/src/app/features/settings/settings.ts` (metodo `downloadJson`), `dashboard.ts` (tema y `startViewTransition`).
- `frontend/src/app/core/services/realtime.service.ts` (`onHeartbeat`) y `dashboard.ts` (`ngOnDestroy`).
- `frontend/src/app/core/services/language.service.ts` (metodo `t`) — mover el diccionario fuera de la clase como `const TRANSLATIONS = {...} as const`.
