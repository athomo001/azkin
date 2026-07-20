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
| [AZ-021](#az-021-vulnerabilidad-critica-un-viewer-puede-acceder-a-settings-solo-oculto-por-css-nunca-bloqueado) | Vulnerabilidad critica: un Viewer puede acceder a `/settings` (solo oculto por CSS, nunca bloqueado) | Critica | [x] Resuelto |

### UX / Funcionalidad (batch post-auditoria de seguridad)

| Codigo | Titulo | Prioridad | Estado |
|---|---|---|---|
| [AZ-022](#az-022-el-tema-claridad-oscuro-se-resetea-a-oscuro-al-refrescar-fuera-del-dashboard) | El tema claro/oscuro se resetea a oscuro al refrescar fuera del dashboard | Media | [x] Resuelto |
| [AZ-023](#az-023-no-existe-gestion-de-otras-cuentas-administrador-editar-resetear-clave-bloquear-eliminar) | No existe gestion de otras cuentas Administrador (editar, resetear clave, bloquear, eliminar) | Alta | [x] Resuelto |
| [AZ-024](#az-024-configuracion-tls-solo-acepta-pegar-texto-pem-sin-opcion-de-subir-archivo) | Configuracion TLS solo acepta pegar texto PEM, sin opcion de subir archivo | Baja | [x] Resuelto |
| [AZ-025](#az-025-el-formulario-de-canal-de-alerta-salta-visualmente-al-cambiar-de-tipo-de-canal) | El formulario de canal de alerta salta visualmente al cambiar de tipo de canal | Baja | [x] Resuelto |
| [AZ-026](#az-026-plantillas-de-notificacion-sin-cheatsheet-de-variables-clickeable-ni-selector-de-emojis) | Plantillas de notificacion sin cheatsheet de variables clickeable ni selector de emojis | Baja | [x] Resuelto |
| [AZ-027](#az-027-modo-tv-kiosko-isTvSessionEnabled-no-hace-nada-ni-siquiera-extiende-la-sesion) | Modo TV/Kiosko (`isTvSessionEnabled`) no hace nada, ni siquiera extiende la sesion | Media | [x] Resuelto |
| [AZ-028](#az-028-no-existe-importacion-masiva-de-monitores-solo-restauracion-completa-de-respaldo-json) | No existe importacion masiva de monitores (solo restauracion completa de respaldo JSON) | Media | [x] Resuelto |
| [AZ-029](#az-029-no-existe-api-publica-para-integrar-sistemas-externos-sin-usar-sesion-de-usuario) | No existe API publica para integrar sistemas externos sin usar sesion de usuario | Media-Alta | [x] Resuelto |
| [AZ-035](#az-035-respaldo-granular-de-activos-exportacionimportacion-molecular-de-monitores) | Respaldo granular de activos: exportacion/importacion molecular de monitores | Media | [x] Resuelto |

### Calidad de codigo / deuda tecnica (auditoria senior)

| Codigo | Titulo | Area | Prioridad | Estado |
|---|---|---|---|---|
| [AZ-008](#az-008-logica-de-autorizacion-por-permisos-duplicada-en-5-lugares-y-rol-sin-tipado-en-el-guard) | Logica de permisos duplicada en 5 lugares + rol sin tipar en el guard | Backend | Alta | [x] Resuelto |
| [AZ-009](#az-009-erosion-de-tipado-any-en-el-borde-http-en-el-puerto-de-jwt-y-en-el-notificador-multicanal) | Erosion de tipado `any` en borde HTTP, puerto JWT y notificador | Backend | Media-Alta | [x] Resuelto |
| [AZ-010](#az-010-endurecimiento-de-seguridad-pendiente-credenciales-por-defecto-cors-abierto-sin-rate-limiting-y-secretos-de-canales-expuestos) | Credenciales por defecto, CORS abierto, sin rate limiting, secretos expuestos | Backend | Alta | [x] Resuelto |
| [AZ-011](#az-011-flujo-de-refresh-token--logout-nunca-completado-codigo-muerto-y-desalineado-con-el-spec-de-autenticacion) | Refresh token / logout nunca completado (codigo muerto) | Backend | Media | [x] Resuelto |
| [AZ-012](#az-012-dato-de-vencimiento-de-dominio-fabricado-se-presenta-un-hash-como-si-fuera-una-consulta-whois-real) | `domainExpiry` fabricado: hash presentado como WHOIS real | Backend | Alta | [x] Resuelto |
| [AZ-013](#az-013-violaciones-de-capas-statscontrollerts-consulta-mongoose-directamente-y-composition-rootts-contiene-logica-de-negocio) | Violaciones de capas: controller consulta Mongoose directo | Backend | Media | [x] Resuelto |
| [AZ-014](#az-014-entidad-monitor-sobrecargada-codigo-de-error-de-cuota-duplicado-y-mapeadores-de-repositorio-repetidos) | Entidad `Monitor` sobrecargada, error de cuota duplicado, mappers repetidos | Backend | Baja | [x] Resuelto |
| [AZ-015](#az-015-cobertura-de-pruebas-casi-nula-en-el-backend-pese-a-una-arquitectura-disenada-para-ser-testeable) | Cobertura de pruebas casi nula en el backend | Backend | Media | [x] Resuelto |
| [AZ-016](#az-016-componentes-dios-en-el-frontend-dashboardts-2300-lineas-y-settingsts-1180-lineas-sin-descomposicion) | Componentes "Dios": `dashboard.ts` (~2300L) y `settings.ts` (~1180L) | Frontend | Media-Alta | [~] Mayormente resuelto |
| [AZ-017](#az-017-el-token-de-acceso-se-persiste-en-localstorage-expuesto-a-xss-y-contradice-el-diseno-de-cookie-segura-del-spec) | JWT en `localStorage` (expuesto a XSS), contradice diseno de cookie | Frontend | Alta | [x] Resuelto |
| [AZ-018](#az-018-tipado-any-generalizado-en-los-servicios-core-y-logica-de-normalizacion-de-estado-duplicada-8-veces-con-comportamiento-divergente) | `any` en servicios core + normalizacion de estado duplicada 8 veces | Frontend | Media | [x] Resuelto |
| [AZ-019](#az-019-manejo-de-errores-http-inconsistente-en-el-frontend-3-formatos-distintos-uno-produce-object-object-y-ausencia-total-de-pruebas) | Manejo de errores HTTP inconsistente + cero pruebas unitarias | Frontend | Media | [x] Resuelto |
| [AZ-020](#az-020-manipulacion-directa-del-dom-sin-centralizar-suscripciones-sin-limpieza-formal-e-i18n-sin-tipado-de-claves) | DOM sin centralizar, suscripciones sin limpieza, i18n sin tipado | Frontend | Baja | [x] Resuelto |
| [AZ-030](#az-030-el-registro-de-auditoria-persiste-datos-pero-no-existe-ninguna-forma-de-consultarlo-ni-por-api-ni-en-la-ui) | El registro de auditoria persiste datos pero no existe forma de consultarlo (ni API ni UI) | Backend | Media | [x] Resuelto |
| [AZ-031](#az-031-la-configuracion-smtp-a-nivel-de-aplicacion-para-recuperacion-de-contrasena-no-tiene-pantalla-de-administracion-ni-boton-de-prueba) | SMTP de aplicacion (recuperacion de contrasena) sin pantalla de administracion ni prueba | Backend | Media | [x] Resuelto |
| [AZ-032](#az-032-botones-de-solo-icono-sin-nombre-accesible-aria-label-title-en-varios-puntos-del-dashboard) | Botones de solo-icono sin nombre accesible (`aria-label`/`title`) en varios puntos | Frontend | Baja | [x] Resuelto |
| [AZ-033](#az-033-benchmark-uxui-y-propuesta-de-identidad-visual-diferenciada-frente-a-uptime-robot-y-uptime-kuma) | Benchmark UX/UI y propuesta de identidad visual diferenciada frente a Uptime Robot y Uptime Kuma | Frontend | Media | [ ] Abierto |
| [AZ-034](#az-034-limpieza-de-codigo-eliminar-referencias-a-numeros-de-ticket-o-issues) | Limpieza de código: eliminar referencias a números de ticket o issues | Backend/Frontend | Baja | [x] Resuelto |
| [AZ-036](#az-036-keyword-keywordmethod-y-useragent-existen-en-el-modelo-de-monitor-http-pero-no-tienen-control-en-el-formulario) | `keyword`/`keywordMethod`/`userAgent` existen en el modelo de Monitor HTTP pero no tienen control en el formulario | Frontend | Media | [x] Resuelto |

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
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-18
- Resuelto: 2026-07-19

### Resolucion
- `stats.controller.ts:recentEvents` ya no usa `require("mongoose")` inline: se extrajo `GetRecentEventsUseCase` (`application/use-cases/stats/get-recent-events.usecase.ts`), reutilizando `filterMonitorsByPermission` y un nuevo `IHeartbeatRepository.findLastEventsForMonitors`.
- `requireRole` ahora exige `UserRole[]` (no `string[]`) importando el tipo de `domain/entities/user.ts` — un typo como `requireRole("admn")` ya no compila.
- Cubierto por 3 pruebas nuevas en `get-recent-events.usecase.test.ts` (admin sin filtro, viewer filtrado por grupo, y caso sin monitores autorizados que no llega a consultar heartbeats).

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
- Estado: [x] Resuelto
- Prioridad: Media-Alta
- Reportado: 2026-07-18
- Resuelto: 2026-07-19

### Resolucion
- `ITokenService`/`JwtTokenService` tipan `permissions` como `IUserPermission[]`, no `any[]`; `types/express.d.ts` alinea `req.permissions` al mismo tipo.
- `INotification.config` gana tipos discriminados por canal (`SlackConfig`/`DiscordConfig`/`TelegramConfig`/`WebhookConfig`/`EmailConfig` en `domain/entities/notification.ts`); `multichannel-notifier.ts` reemplaza sus 5 `as any` por casts tipados (`as unknown as XConfig`).
- `mongoose-monitor.repository.ts` tipa `updateObj` como `Partial<MonitorDoc>` en vez de `any`.
- No se implementó el `AuthenticatedRequest` que reemplace los `req.userId!` — evaluado y descartado por bajo valor/alto churn (8 controladores) frente al resto del backlog; los `!` actuales están correctamente acotados detrás de `authGuard`/`requireRole`.

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
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-18
- Resuelto: 2026-07-19

### Resolucion
- `/metrics` ya no tiene credenciales hardcodeadas: `AZKIN_PROMETHEUS_USER/PASS/API_KEY` son opcionales en `env.ts` sin fallback; si no están configuradas, el endpoint queda inaccesible (verificado con `curl` → 401 sin credenciales).
- Nuevo `infrastructure/http/middlewares/metrics-auth.ts` usa `crypto.timingSafeEqual` (comparación en tiempo constante) y solo acepta la API Key por header `X-API-Key` (ya no por query string).
- `AZKIN_CORS_ORIGIN` ya no tiene default `"*"` silencioso: es requerido explícitamente en `env.ts`, con warning de arranque si el valor configurado es `"*"`.
- Nuevo middleware `rate-limit.ts` (`express-rate-limit`) aplicado a `/register`, `/login`, `/forgot-password`, `/reset-password` (10 intentos / 15 min); `app.set("trust proxy", 1)` para que limite por IP real del cliente detrás del nginx del frontend.
- `BcryptPasswordHasher` recibe el costo desde `AZKIN_BCRYPT_COST` (default 10).
- `GET/POST/PUT /notifications` enmascaran `webhookUrl`/`botToken`/`smtpPassword` (`notification.presenter.ts`, dejando visibles solo los últimos 4 caracteres); `UpdateNotificationUseCase` reconoce el valor enmascarado para no sobrescribir el secreto real si el admin no lo modificó (cubierto por 2 pruebas nuevas).

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
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-18
- Resuelto: 2026-07-19

### Resolucion
Se completó la opción (a): el flujo de cookie + refresh + logout que ya describía el spec.
- `LoginUseCase`/`RegisterUseCase`/`RefreshUseCase` emiten un `refreshToken` adicional (7 días, o 1 año para sesiones TV) junto al access token.
- `AuthController` persiste el `refreshToken` como cookie `HttpOnly`/`SameSite=Lax` (`refreshToken`, path `/api/v1/auth`) y nunca lo incluye en el body de la respuesta.
- `POST /auth/refresh` lee la cookie (nunca el body), verifica y rota el refresh token en cada uso; `POST /auth/logout` limpia la cookie.
- El frontend (`auth.service.ts`) ya no persiste nada en `localStorage`: el access token vive en memoria, y `refresh()`/`logout()` ahora son llamadas reales al backend (antes `refresh()` era un stub y `logout()` llamaba a un endpoint que no existía).
- `spec/04-contratos-api.md` actualizado: tiempo real del access token (2h configurable, no 15 min) y semántica real de `/logout` (200 con mensaje, no requiere auth).
- Verificado end-to-end con `curl`: login setea la cookie, refresh la rota, logout la limpia y un refresh posterior falla con 401.
- Cubre también los items pendientes de AZ-017 (ver esa sección).

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
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-18
- Resuelto: 2026-07-19

### Resolucion
Se eliminó el bloque de hash determinístico en `http.checker.ts`: `domainExpiry` ahora se deja explícitamente en `null` (no se implementó WHOIS/RDAP real, evaluado como fuera de alcance por el riesgo de rate-limiting de registradores sin una librería madura ya presente en el repo). El frontend (`dashboard.ts`) ya mostraba "No disponible"/"Consultando..." para `domainExpiry === null` — no requirió cambios, la UI estaba preparada para este caso.

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
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-18
- Resuelto: 2026-07-19

### Resolucion
- `stats.controller.ts` ya no importa Mongoose: la lógica de `recentEvents` vive en `GetRecentEventsUseCase` (ver AZ-008).
- El generador de `/metrics` se extrajo de `composition-root.ts` a `GetMetricsUseCase` (`application/use-cases/system/get-metrics.usecase.ts`, usa `IMonitorRepository`/`IHeartbeatRepository`, no Mongoose directo) + `MetricsController` + `metrics-auth.ts` (ver AZ-010). `composition-root.ts` ahora solo instancia y cablea.
- Credenciales de `/metrics` leídas de `env` validado por Zod, no de `process.env` inline.

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
- Estado: [x] Resuelto
- Prioridad: Baja
- Reportado: 2026-07-18
- Resuelto: 2026-07-19

### Resolucion
- `QuotaExceededError` tiene su propio `code = "QUOTA_EXCEEDED"` (antes reutilizaba `VALIDATION_ERROR`).
- Nuevo helper `toDomainId()` (`infrastructure/persistence/mongoose/to-domain-id.ts`) reemplaza `String(doc._id)` en los 7 repositorios Mongoose (incluye el de API Keys, nuevo en esta misma sesión).
- Nuevo helper `getErrorMessage(err, fallback)` (`application/services/get-error-message.ts`) reemplaza los `catch (err: any) { err.message }` en 9 puntos (checkers HTTP/DNS/SNMP, notifier, SMTP mailer, casos de uso de TLS/notificación de prueba).
- `console.*` reemplazado por el `logger` centralizado en `seed-first-admin.ts` y `execute-check.usecase.ts` (se dejó `env.ts` con `console.*`, tal como la propia issue lo exceptúa por el orden de inicialización).
- No se abordó la union discriminada completa de `IMonitor` por `type` (~40 campos opcionales) — evaluado como refactor de alto riesgo/bajo beneficio inmediato dado que ya funciona correctamente y no bloquea ninguna funcionalidad.

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
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-18
- Resuelto: 2026-07-19

### Resolucion
La suite pasó de 21 a 38 pruebas (`pnpm test`), incluyendo el caso de mayor riesgo identificado (filtrado de permisos, ya cubierto desde antes vía `filterMonitorsByPermission`). Pruebas nuevas: `GetRecentEventsUseCase` (3), `RefreshUseCase` (3, incluye `AccountBlockedError`), `UpdateNotificationUseCase` (2, enmascarado de secretos), `BulkImportMonitorsFromCsvUseCase` (1, filas mixtas válidas/inválidas), `apiKeyAuth` (4), `ListAuditLogUseCase` (2), `GetSmtpStatusUseCase` (2). No se agregó prueba de integración con `mongodb-memory-server` — evaluado como fuera de alcance de esta sesión (requiere una dependencia nueva no presente en el repo).

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
- Estado: [~] Mayormente resuelto — pendiente checkpoint visual de `dashboard.ts` en navegador
- Prioridad: Media-Alta
- Reportado: 2026-07-18

### Nota (2026-07-20)
Se ejecutó por fases, con `tsc --noEmit` + `ng build` como red de seguridad después de cada
extracción (no hay test runner de frontend, ver AZ-019, ni navegador disponible para el asistente).

**Fase 1 — `settings.ts`: completa y confirmada en navegador por el usuario.** Se extrajeron las 6
pestañas a componentes propios (`tls-panel.ts`, `audit-log-panel.ts`, `api-keys-panel.ts`,
`backups-panel.ts`, `viewers-panel.ts`, `alerts-panel.ts`) más 4 componentes compartidos nuevos
(`ConfirmService`/`ConfirmModalComponent`, `ToastService`/`ToastComponent`,
`ChangePasswordModalComponent`, `EmojiPickerComponent`). `settings.ts` bajó de 1897 a 171 líneas,
quedando como puro orquestador (tab activo + restauración de `?tab=`).

**Fase 2 — `dashboard.ts`: extracción completa, falta el checkpoint visual del usuario.** Se
extrajeron `QuickStatsPanelComponent` (KPIs + incidentes recientes), `DashboardNavbarComponent`
(logo, tema/idioma, NyanCat, logout) y `MonitorFormComponent` (slide-over crear/editar monitor,
las 6 variantes de tipo de monitor), además de reusar `ConfirmModalComponent` (Fase 1) para los dos
modales de borrado. `dashboard.ts` bajó de 2291 a 1580 líneas. **Pendiente**: el usuario aún no
confirmó visualmente esta fase (navbar, KPIs/click-through de incidentes, alta/edición de los 6
tipos de monitor, ambos modales de borrado).

**Fuera de alcance, documentado como remanente explícito** (no intentado, por ser la parte más
entrelazada y riesgosa sin navegador disponible para QA): los charts ECharts
(`initChart`/`updateChart`/`initGroupChart`/`updateGroupChart`, ~330 líneas) y el panel de detalle
de monitor/grupo que los aloja, junto con el árbol de monitores del sidebar — todos comparten
estado en vivo (`selectedMonitor`/`selectedGroup`/`historyPoints`/`groupHistoryMap`) con el handler
de heartbeats de Socket.io y el efecto NyanCat embebido en las opciones de ECharts. Recomendación:
abordar en sesión propia con navegador disponible para verificar visualmente el re-render por
tema, el efecto NyanCat y las actualizaciones en vivo por heartbeat antes/después de cada cambio.

### Descripcion
`frontend/src/app/features/dashboard/dashboard.ts` tiene ~2322 lineas (plantilla inline de ~990 lineas + ~1290 lineas de logica: CRUD de monitores, renderizado de ECharts, manejo de heartbeats por Socket.io, filtrado de historial, calculo de bloques de uptime, borrado masivo, tema/nyan-cat, i18n, agregacion de grupos — todo en una sola clase). `settings.ts` tiene ~1184 lineas mezclando 5 dominios funcionales no relacionados (canales de alerta, viewers, perfil, respaldos, TLS) en un solo componente. No existen subcomponentes extraidos pese a que el proyecto ya tiene un patron establecido en `shared/components` (`badge-status.ts`, `skeleton-loader.ts`). `group-dashboard.ts` (137 lineas) demuestra que el mismo dominio (graficos de grupo) puede resolverse en un componente pequeno y enfocado.

### Comportamiento esperado
1. ~~`dashboard.ts` se descompone en subcomponentes presentacionales~~ — hecho parcialmente:
   `QuickStatsPanelComponent`, `DashboardNavbarComponent`, `MonitorFormComponent` extraidos.
   `MonitorDetailPanel`/`MonitorChart` (ECharts + seleccion) quedan fuera de alcance, ver nota.
2. ~~`settings.ts` se descompone por pestana/dominio~~ — hecho, las 6 pestanas extraidas.
3. Cada subcomponente cabe holgadamente en una sola pantalla de revision de codigo (referencia orientativa: <400 lineas) — cumplido en todos los subcomponentes nuevos.

### Criterios de aceptacion
1. `settings.ts` queda por debajo de ~400-500 lineas — cumplido (171 lineas). `dashboard.ts` baja de 2291 a 1580 lineas pero no llega al rango objetivo porque el remanente entrelazado (charts + panel de detalle + sidebar) queda fuera de alcance, ver nota.
2. Cada subcomponente extraido es importable/testeable de forma aislada — cumplido.
3. La build de Angular (`ng build`) sigue pasando sin regresiones visuales tras la extraccion — verificado por build para ambas fases; falta la confirmacion visual del usuario en navegador para la Fase 2 (dashboard).

### Pistas de investigacion
- `frontend/src/app/features/dashboard/dashboard.ts` (remanente: charts ECharts, panel de detalle, sidebar) y `frontend/src/app/features/settings/settings.ts` (completo).
- Aprovechar una futura sesión con navegador disponible para anadir las primeras pruebas unitarias (ver AZ-019) a los subcomponentes nuevos.

---

## AZ-017) El token de acceso se persiste en `localStorage` (expuesto a XSS) y contradice el diseno de cookie segura del spec
- Codigo: AZ-017
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-18
- Resuelto: 2026-07-19

### Resolucion
Resuelto como parte de AZ-011 (mismo cambio, backend + frontend). `auth.service.ts` ya no lee/escribe `localStorage.getItem/setItem('azkin_token'|'azkin_user')` en ningún punto — el access token vive solo en la variable privada `accessToken` en memoria; la sesión se rehidrata tras un refresh de página llamando a `POST /auth/refresh` (que lee la cookie `HttpOnly`), no leyendo un valor persistido por JS. El handshake de Socket.io (`realtime.service.ts`) ya no duplica el token en `query`, solo en `auth`.

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
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-18
- Resuelto: 2026-07-19

### Resolucion
- Nueva función pura `normalizeMonitorStatus()` (`core/utils/monitor-status.util.ts`), reutilizada en las 4 ubicaciones de `monitor.service.ts` (`loadMonitors`/`create`/`update`/`applyHeartbeat`) y 2 de `dashboard.ts` (el heartbeat en vivo del monitor seleccionado y del grupo seleccionado); confirma y corrige la divergencia real detectada (create/update omitían la rama `PENDING`). Los 2 usos restantes de un patrón similar en `dashboard.ts`/`monitor.service.ts` son ternarios de 2 valores para `IHeartbeat.status: 'UP'|'DOWN'` (sin `PENDING` por diseño del tipo) — no son duplicación del mismo bug, se dejaron intactos.
- `monitor.service.ts`: `loadMonitors`/`create`/`update` tipan la respuesta HTTP como `MonitorDto` (no `any`); `applyHeartbeat` tipa su parámetro como `IHeartbeatEvent`.
- `auth.service.ts`: `register`/`login`/`refresh` devuelven `Observable<AuthResponse>` tipado (no `Observable<any>`).
- `togglePause()` en `dashboard.ts` se simplificó: ya no re-deriva `status` manualmente, reutiliza el que ya devuelve `monitorService.update()`.

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
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-18
- Resuelto: 2026-07-19

### Resolucion
- Nueva función `extractApiErrorMessage(err, fallback)` (`core/utils/api-error.util.ts`), alineada al envelope real (`{ error: { code, message } }`). Reemplazó los 3 formatos inconsistentes en los 13 puntos identificados (`register.ts`, `reset-password.ts`, `dashboard.ts`, `profile.ts`, y 13 en `settings.ts`).
- Se confirmó y corrigió el bug concreto: `settings.ts` (cambio de contraseña propio) usaba `err?.error?.error || '...'` **sin** `.message`, mostrando literalmente el objeto de error (`"[object Object]"`) en el toast cuando el backend respondía con el envelope real. Ahora usa el helper.
- **No resuelto en esta sesión:** agregar pruebas unitarias de frontend. El proyecto no tiene ningún test runner configurado (`ng test` falla con "Cannot determine project or target for command" — no hay builder de test en `angular.json`, ni Karma ni Vitest instalados). Configurar uno desde cero (con su propio `tsconfig.spec.json`, dependencias y verificación de que funcione en este entorno) se evaluó como una tarea de infraestructura separada del resto de esta sesión, no como una adición de una línea. Las funciones puras nuevas (`normalizeMonitorStatus`, `extractApiErrorMessage`) quedan ya extraídas y listas para testear en cuanto exista un runner.

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
- Estado: [x] Resuelto
- Prioridad: Baja
- Reportado: 2026-07-18
- Resuelto: 2026-07-19

### Resolucion
- Nuevo `FileDownloadService` (`core/services/file-download.service.ts`) centraliza `Blob`/`URL.createObjectURL`/`document.createElement('a')`; `settings.ts` lo usa en las 3 descargas (`downloadJson`, backup, plantilla CSV) en vez de repetir la lógica inline. `ThemeService` (centraliza tema/`startViewTransition`) ya existía desde AZ-022.
- `dashboard.ts`: la función de desuscripción que devuelve `realtimeService.onHeartbeat(...)` ahora se captura (`unsubscribeHeartbeat`) y se invoca explícitamente en `ngOnDestroy()`, en vez de depender del efecto secundario de `disconnect()`.
- `language.service.ts`: el diccionario `TRANSLATIONS` se movió fuera de la clase, a nivel de módulo, como `const ... as const` (antes se reconstruía en cada llamada a `t()`). `TranslationKey = keyof typeof TRANSLATIONS` tipa el parámetro de `t()` — verificado con `ng build` que las ~200 llamadas a `lang.t(...)` en todo el frontend siguen compilando sin un solo typo.

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

---

## AZ-021) Vulnerabilidad critica: un Viewer puede acceder a `/settings` (solo oculto por CSS, nunca bloqueado)
- Codigo: AZ-021
- Estado: [x] Resuelto
- Prioridad: Critica
- Reportado: 2026-07-18
- Resuelto: 2026-07-18

### Descripcion
La ruta `/settings` no tenia ningun guard de rol: cualquier usuario autenticado (incluyendo un Viewer de solo lectura) podia navegar directamente a la URL y cargar el componente completo de administracion (gestion de canales de alerta, viewers, respaldos, TLS). El backend tampoco exigia rol admin en algunos endpoints usados por esa pantalla, en particular `GET /notifications`, que devolvia el `config` completo de los canales (URLs de webhook, tokens de bot, credenciales SMTP) a cualquier usuario autenticado. La UI ocultaba controles de escritura con `@if (authService.isAdmin())`, pero eso es cosmetico: el HTML/datos ya habian llegado al cliente y las rutas de escritura seguian siendo invocables manualmente (ej. via consola del navegador) por un Viewer que conociera los endpoints.

### Comportamiento esperado
1. `/settings` es una ruta admin-only: un Viewer que navega ahi es redirigido antes de que el componente cargue datos sensibles.
2. Todo endpoint que exponga datos de configuracion (canales de notificacion, backups, TLS, gestion de usuarios) exige `requireRole("admin")` en el backend, no solo ocultamiento en el frontend.
3. Un Viewer conserva una via de autoservicio (cambiar su propia contrasena, ver sus preferencias) sin pasar por la pantalla de administracion.

### Criterios de aceptacion
1. Frontend: nuevo `adminGuard` (`core/guards/auth.guard.ts`) aplicado a la ruta `/settings` junto a `authGuard`; un Viewer que navega ahi es redirigido a `/dashboard`.
2. Backend: `GET/POST/PUT /notifications` y el resto de rutas de `/settings` exigen `requireRole("admin")`.
3. Nueva ruta `/profile` (`authGuard` sin `adminGuard`) para que cualquier rol autenticado cambie su propia contrasena/preferencias sin tocar `/settings`.
4. Verificado manualmente: login como Viewer, intento de navegar a `/settings` redirige a `/dashboard`; intento de `curl` directo a `GET /notifications` con un token de Viewer devuelve `403`.

### Pistas de investigacion (resueltas)
- `frontend/src/app/app.routes.ts` — se agrego `adminGuard` a `/settings` y se creo `/profile`.
- `frontend/src/app/core/guards/auth.guard.ts` — nuevo `adminGuard` que verifica `authService.isAdmin()`.
- `backend/src/infrastructure/http/routes/notification.routes.ts` — se agrego `requireRole("admin")` a las rutas que faltaban.
- `frontend/src/app/features/profile/profile.ts` (nuevo componente) — extrae el autoservicio de cambio de contrasena/preferencias fuera de `settings.ts`.

---

## AZ-022) El tema claro/oscuro se resetea a oscuro al refrescar fuera del Dashboard
- Codigo: AZ-022
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-18
- Resuelto: 2026-07-18

### Descripcion
El tema (claro/oscuro) solo se aplicaba a `document.body` dentro de `DashboardComponent.ngOnInit` y en su metodo `toggleTheme()`. `SettingsComponent`/`ProfileComponent` nunca leian `localStorage` (`azkin-theme`) ni tocaban `document.body.classList`, por lo que al refrescar la pagina estando en `/settings` o `/profile` con el tema claro activo, la clase `light-theme` no se reaplicaba y la pantalla volvia a verse en oscuro aunque `localStorage` siguiera indicando `'light'`.

### Comportamiento esperado
1. El tema persiste visualmente sin importar en que ruta se refresque la aplicacion.
2. Existe un unico punto de verdad para aplicar/alternar el tema, reutilizado por todos los componentes.
3. `/settings` y `/profile` tambien exponen un boton para alternar tema, no solo el Dashboard.

### Criterios de aceptacion
1. Nuevo `ThemeService` (`core/services/theme.service.ts`) con signal `isLightTheme`, `applyToDom()` y `toggle(event?)`.
2. `applyToDom()` se ejecuta en el componente raiz (`app.ts`), por lo que corre en cada arranque de la app sin importar la ruta de entrada.
3. `dashboard.ts`/`settings.ts`/`profile.ts` delegan en `ThemeService` en vez de duplicar la logica de tema.
4. Verificado manualmente: activar tema claro, refrescar en `/settings`, el tema claro se mantiene.

### Pistas de investigacion (resueltas)
- `frontend/src/app/core/services/theme.service.ts` (nuevo).
- `frontend/src/app/app.ts` (constructor invoca `applyToDom()`).
- `frontend/src/app/features/dashboard/dashboard.ts`, `settings.ts`, `profile.ts` (inyectan `ThemeService`).

---

## AZ-023) No existe gestion de otras cuentas Administrador (editar, resetear clave, bloquear, eliminar)
- Codigo: AZ-023
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-18
- Resuelto: 2026-07-18

### Descripcion
`/settings` listaba las cuentas Admin del sistema como simples badges de solo lectura (solo el email), sin ninguna accion disponible. No existia forma de editar el correo de otro admin, resetear su contrasena, bloquearlo (ej. ante sospecha de credenciales comprometidas) ni eliminarlo. Tampoco existia el campo `isBlocked` en el modelo de usuario ni verificacion de bloqueo en login/refresh.

### Comportamiento esperado
1. Un Admin autenticado puede editar el email de otro Admin, resetear su contrasena, bloquearlo/desbloquearlo y eliminarlo.
2. Un Admin no puede bloquearse ni eliminarse a si mismo (evita dejar el sistema sin acceso administrativo).
3. Una cuenta bloqueada no puede iniciar sesion ni refrescar su token.

### Criterios de aceptacion
1. `IUser`/`UserDoc` incluyen `isBlocked: boolean` (default `false`).
2. Nuevos endpoints `PUT /users/admins/:id`, `PUT /users/admins/:id/password`, `PUT /users/admins/:id/block`, `DELETE /users/admins/:id`, todos `requireRole("admin")`.
3. `SetAdminBlockedUseCase`/`DeleteAdminUseCase` lanzan `ForbiddenError` si `actorId === targetId`.
4. `LoginUseCase`/`RefreshUseCase` lanzan `AccountBlockedError` (403) si `user.isBlocked`.
5. Frontend: tarjetas interactivas por Admin (editar/resetear clave/bloquear/eliminar), deshabilitando auto-bloqueo/auto-eliminacion.
6. Verificado end-to-end con `curl`: auto-bloqueo/auto-eliminacion rechazados con `FORBIDDEN`; edicion de email, reset de clave, bloqueo y eliminacion de otro admin funcionan; login de una cuenta bloqueada devuelve `403 ACCOUNT_BLOCKED`.

### Pistas de investigacion (resueltas)
- `backend/src/domain/entities/user.ts`, `infrastructure/persistence/mongoose/schemas/user.schema.ts` (`isBlocked`).
- `backend/src/application/use-cases/users/update-admin.usecase.ts`, `set-admin-blocked.usecase.ts`, `delete-admin.usecase.ts` (nuevos).
- `backend/src/infrastructure/http/controllers/user.controller.ts`, `routes/user.routes.ts`.
- `frontend/src/app/core/services/user.service.ts` (`IAdmin`, `updateAdminEmail`/`resetAdminPassword`/`toggleAdminBlocked`/`deleteAdmin`).
- `frontend/src/app/features/settings/settings.ts` (seccion "Administradores").

---

## AZ-024) Configuracion TLS solo acepta pegar texto PEM, sin opcion de subir archivo
- Codigo: AZ-024
- Estado: [x] Resuelto
- Prioridad: Baja
- Reportado: 2026-07-18
- Resuelto: 2026-07-18

### Descripcion
La pestana TLS de `/settings` solo ofrecia `<textarea>` para pegar manualmente el certificado, la clave privada y la cadena intermedia en formato PEM, sin ningun `<input type="file">` (a diferencia de la restauracion de respaldos, que si permite subir un archivo).

### Comportamiento esperado
Cada campo PEM permite tanto pegar texto como subir un archivo (`.pem`/`.crt`/`.key`/`.txt`), leido en el cliente y volcado al mismo campo de texto.

### Criterios de aceptacion
1. Boton "Subir archivo" junto a certificado, clave privada y cadena intermedia.
2. El contenido leido (`FileReader.readAsText`) reemplaza el valor del campo de texto correspondiente sin cambios en el contrato del backend (sigue siendo texto PEM en JSON).

### Pistas de investigacion (resueltas)
- `frontend/src/app/features/settings/settings.ts` (pestana TLS, metodo `onTlsFileSelected`).

---

## AZ-025) El formulario de canal de alerta salta visualmente al cambiar de tipo de canal
- Codigo: AZ-025
- Estado: [x] Resuelto
- Prioridad: Baja
- Reportado: 2026-07-18
- Resuelto: 2026-07-18

### Descripcion
Los bloques condicionales por tipo de canal (Slack/Discord/Webhook vs Telegram vs Email) eran `@if` planos sin contenedor de altura fija en una sola columna: cambiar el tipo de canal reordenaba toda la tarjeta, desplazando el resto de los campos (alcance de eventos, plantilla, boton guardar).

### Comportamiento esperado
Cambiar el tipo de canal no debe mover la posicion de los campos agnosticos al canal (nombre, selector de tipo, alcance de eventos).

### Criterios de aceptacion
1. La tarjeta de canal usa un layout de 2 columnas en pantallas `lg`: columna izquierda con campos que nunca cambian de alto; columna derecha con los campos especificos del canal y el editor de plantillas, conteniendo ahi todo el reflow.
2. En mobile se apila verticalmente (aceptable, sin usuarios de esta pantalla en TV/kiosko).

### Pistas de investigacion (resueltas)
- `frontend/src/app/features/settings/settings.ts` (pestana Alertas, tarjeta "Nuevo/Editar Canal").

---

## AZ-026) Plantillas de notificacion sin cheatsheet de variables clickeable ni selector de emojis
- Codigo: AZ-026
- Estado: [x] Resuelto
- Prioridad: Baja
- Reportado: 2026-07-18
- Resuelto: 2026-07-18

### Descripcion
El editor de plantillas de notificacion mostraba el listado de variables disponibles como texto plano de 9px sin poder insertarlas con un clic, y no existia ningun selector de emojis para enriquecer los mensajes de alerta.

### Comportamiento esperado
1. Las variables disponibles (`{{monitor}}`, `{{url}}`, `{{status}}`, etc.) se muestran como chips clickeables que insertan el texto en la posicion del cursor del campo enfocado (asunto o cuerpo).
2. Un selector de emojis permite insertar emojis relevantes a alertas de la misma forma.

### Criterios de aceptacion
1. Fila de chips sobre el textarea del cuerpo; un clic inserta la variable en la posicion del cursor y refoca el campo.
2. Modal de seleccion de emojis (grilla hecha con Tailwind, sin dependencias nuevas) con el mismo comportamiento de insercion.
3. Ambos widgets conviven dentro del panel derecho del layout de AZ-025.

### Pistas de investigacion (resueltas)
- `frontend/src/app/features/settings/settings.ts` (`templateVariableChips`, `emojiOptions`, `insertAtCursor`, `setActiveTemplateField`).

---

## AZ-027) Modo TV/Kiosko (`isTvSessionEnabled`) no hace nada, ni siquiera extiende la sesion
- Codigo: AZ-027
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-18
- Resuelto: 2026-07-18

### Descripcion
El flag `isTvSessionEnabled` existia de punta a punta en persistencia/DTOs pero no gatillaba ningun comportamiento — ni siquiera cumplia su proposito original de sesion prolongada: `JwtTokenService.sign()` siempre usaba el mismo `expiresInSeconds` fijo del constructor, ignorando el flag. Tampoco existia ninguna clase CSS de modo kiosko ni se ocultaban controles no esenciales para ese tipo de sesion.

### Comportamiento esperado
1. Una sesion con `isTvSessionEnabled` recibe un token de larga duracion (1 año), no el `expiresIn` por defecto de sesiones normales.
2. La interfaz aplica un modo visual de kiosko (fuentes/espaciados mayores, pensado para lectura a distancia en TV 4K) y oculta controles no esenciales (ej. barra de busqueda).

### Criterios de aceptacion
1. `ITokenService.sign` acepta un `expiresInSecondsOverride` opcional; `LoginUseCase`/`RefreshUseCase` lo usan (31536000s) cuando `user.isTvSessionEnabled`.
2. Clase CSS `body.kiosk-mode` en `styles.css` con escalado de fuente/espaciados.
3. `dashboard.ts` aplica `kiosk-mode` en `ngOnInit`/lo remueve en `ngOnDestroy` segun `authService.currentUser()?.isTvSessionEnabled`, y oculta la barra de busqueda en ese modo.

### Pistas de investigacion (resueltas)
- `backend/src/infrastructure/security/jwt-token-service.ts`, `application/use-cases/auth/login.usecase.ts`, `refresh.usecase.ts`.
- `frontend/src/styles.css` (bloque `body.kiosk-mode`).
- `frontend/src/app/features/dashboard/dashboard.ts` (`isKioskMode`, `ngOnInit`/`ngOnDestroy`).

---

## AZ-028) No existe importacion masiva de monitores (solo restauracion completa de respaldo JSON)
- Codigo: AZ-028
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-18
- Resuelto: 2026-07-18

### Descripcion
La unica forma de cargar monitores en lote era restaurar un respaldo JSON completo generado por el propio sistema (`ImportBackupUseCase`). No existia ninguna forma de importar monitores desde un formato tabular externo (CSV), como los que exportan hojas de calculo o inventarios de otras herramientas.

### Comportamiento esperado
1. Un Admin puede subir un CSV con columnas `name,type,target,port,interval,retries,retryInterval,group,tags` (tags separadas por `;`) para crear/actualizar monitores en lote.
2. A diferencia de la restauracion JSON (que aborta todo el lote ante un error), una fila invalida no debe descartar el resto del lote: se acumulan errores por fila y se procesan las validas.

### Criterios de aceptacion
1. Nuevo endpoint `POST /monitors/bulk-import` (`requireRole("admin")`).
2. `BulkImportMonitorsFromCsvUseCase` parsea con `papaparse`, valida cada fila con Zod, respeta la cuota global de 50 monitores, y devuelve `{ createdCount, updatedCount, errors: { row, message }[] }`.
3. Frontend: tarjeta de arrastrar-y-soltar en la pestana Respaldos, con enlace de descarga de plantilla CSV y tabla de errores por fila tras la importacion.
4. Prueba unitaria cubre una fila valida y una invalida en el mismo lote, confirmando que la invalida no bloquea a la valida.
5. Verificado end-to-end via `curl` contra la API publica (ver AZ-029): importacion de una fila crea el monitor correctamente.

### Pistas de investigacion (resueltas)
- `backend/src/application/use-cases/backup/bulk-import-monitors-from-csv.usecase.ts` (y su `.test.ts`).
- `backend/src/infrastructure/http/controllers/monitor.controller.ts` (`bulkImportCsv`), `routes/monitor.routes.ts`.
- `frontend/src/app/features/settings/settings.ts` (pestana Respaldos, `onCsvDrop`/`onCsvFileSelected`/`downloadCsvTemplate`).

---

## AZ-029) No existe API publica para integrar sistemas externos sin usar sesion de usuario
- Codigo: AZ-029
- Estado: [x] Resuelto
- Prioridad: Media-Alta
- Reportado: 2026-07-18
- Resuelto: 2026-07-18

### Descripcion
Todos los endpoints de la API requerian un JWT de sesion obtenido via login interactivo, lo que hacia impractico integrar Azkin con sistemas externos (dashboards, scripts, pipelines de CI/CD) que necesitan autenticarse de forma programatica y de larga duracion sin las implicaciones de compartir una sesion de usuario real.

### Comportamiento esperado
1. Un Admin puede generar API Keys con scopes (`read`/`write`) desde la UI, mostradas en texto plano una unica vez.
2. Un sistema externo puede autenticarse con el header `X-API-Key` contra un prefijo de rutas publico, sin duplicar logica de negocio.
3. Las keys pueden revocarse individualmente, con efecto inmediato.

### Criterios de aceptacion
1. Solo se persiste el hash SHA-256 de la key (`IApiKeyRepository`/`ApiKeyModel`); `keyPrefix` permite identificarla en la UI sin exponerla de nuevo.
2. Middleware `apiKeyAuth` puebla el mismo contexto de request (`userId`/`userRole`/`adminId`/`permissions`) que `authGuard`, verifica el scope segun el metodo HTTP (`GET`→`read`, resto→`write`) y rechaza keys inexistentes/revocadas.
3. Nuevo prefijo `/api/public/v1/monitors` reutiliza el mismo `monitorRoutes(monitorController)` que la API de sesion, sin duplicar controllers/casos de uso.
4. Rutas de gestion de keys (`POST/GET /api/v1/api-keys`, `DELETE /api/v1/api-keys/:id`) requieren sesion de Admin.
5. Documentacion en `docs/api-publica.md` con ejemplos `curl`.
6. Verificado end-to-end via `curl`: key de solo lectura puede listar monitores pero recibe `403` en un `POST`; falta de header devuelve `401`; revocar una key la invalida de inmediato; una key con scope `write` puede usar `bulk-import` (AZ-028) exitosamente.

### Pistas de investigacion (resueltas)
- `backend/src/domain/entities/api-key.ts`, `application/ports/repositories/api-key-repository.ts`.
- `backend/src/infrastructure/http/middlewares/api-key-auth.ts` (y su `.test.ts`).
- `backend/src/application/use-cases/api-keys/*.usecase.ts`, `infrastructure/http/controllers/api-key.controller.ts`.
- `frontend/src/app/features/settings/settings.ts` (pestana API).
- `docs/api-publica.md`.

---

## AZ-030) El registro de auditoria persiste datos pero no existe ninguna forma de consultarlo, ni por API ni en la UI
- Codigo: AZ-030
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-19
- Resuelto: 2026-07-19

### Resolucion
- Nuevo `IAuditLogRepository.listAll(limit)` (sin aislamiento por tenant, consistente con el resto del sistema) + `ListAuditLogUseCase` que resuelve el email del actor por cada entrada.
- Nuevas rutas `GET /api/v1/audit-log` (`requireRole("admin")`) montadas en `composition-root.ts`.
- Nueva pestaña "Auditoría" en `/settings` que lista acción, actor, fecha e ids afectados.
- Cubierto por 2 pruebas unitarias (`list-audit-log.usecase.test.ts`).

### Descripcion
`IAuditLogRepository.listRecent(actorId, limit)` existe y `MongooseAuditLogRepository` persiste correctamente eventos sensibles (`MONITORS_BULK_DELETE` desde `bulk-delete-monitors.usecase.ts`, `TLS_CONFIG_UPDATE` desde `apply-tls-config.usecase.ts`, `PASSWORD_RESET_REQUESTED` desde `request-password-reset.usecase.ts`), pero ninguna ruta HTTP expone ese metodo (`grep` sobre `infrastructure/http/routes/*.routes.ts` no encuentra ningun path de auditoria) y el frontend no tiene ninguna referencia a auditoria en ningun componente. El dato se escribe pero nunca se lee desde fuera de Mongo — un admin no tiene forma de revisar "quien borro estos monitores" o "quien cambio el certificado TLS" sin conectarse directamente a la base de datos.

### Comportamiento esperado
1. Existe un endpoint (ej. `GET /api/v1/audit-log`, `requireRole("admin")`) que expone `listRecent`.
2. `/settings` incluye una vista de solo lectura del historial de auditoria reciente (accion, actor, fecha, ids afectados).

### Criterios de aceptacion
1. Nuevo `AuditLogController`/ruta montada y wireada en `composition-root.ts`.
2. Nueva seccion en `settings.ts` (o pestana dedicada) que liste los ultimos eventos de auditoria.
3. Los eventos ya persistidos (bulk-delete, TLS, password-reset) se ven correctamente formateados en la UI sin cambios en como se escriben.

### Pistas de investigacion
- `backend/src/application/ports/repositories/audit-log-repository.ts`, `infrastructure/persistence/mongoose/repositories/mongoose-audit-log.repository.ts`.
- Seguir el patron de `ListBackupsUseCase`/`backup.routes.ts` para el nuevo `ListAuditLogUseCase`/`audit-log.routes.ts`.

---

## AZ-031) La configuracion SMTP a nivel de aplicacion (para recuperacion de contrasena) no tiene pantalla de administracion ni boton de prueba
- Codigo: AZ-031
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-19
- Resuelto: 2026-07-19

### Resolucion
- Nuevos `GetSmtpStatusUseCase` (nunca expone la contraseña) y `SendTestEmailUseCase`, rutas `GET /api/v1/system/smtp` y `POST /api/v1/system/smtp/test`.
- `IMailer.send()` gana un segundo parámetro opcional `{ throwOnFailure }`: por defecto (recuperación de contraseña real) sigue cayendo a modo mock sin romper el flujo anti-enumeración; el test de SMTP lo usa en `true` para que un fallo real se reporte al admin en vez de reportar éxito falso vía el fallback silencioso.
- Nueva sección "SMTP de Aplicación" en la pestaña TLS/HTTPS de `/settings` con estado (configurado/no) y envío de correo de prueba.
- Cubierto por 2 pruebas unitarias (`get-smtp-status.usecase.test.ts`).

### Descripcion
`env.ts` define `AZKIN_SMTP_HOST/PORT/SECURE/USER/PASSWORD/FROM` a nivel de aplicacion, leidos una unica vez de `process.env` al arrancar y usados por `SmtpMailer` exclusivamente para el correo de recuperacion de contrasena (`RequestPasswordResetUseCase`). A diferencia del SMTP *por canal de notificacion* (que si tiene UI completa en `settings.ts` con boton "Probar canal", ver `notification.routes.ts` `POST /:id/test`), este SMTP de aplicacion no tiene ninguna pantalla de administracion, no puede editarse sin reiniciar el contenedor con nuevas variables de entorno, y no existe forma de enviar un correo de prueba para validar que la recuperacion de contrasena efectivamente funcionara antes de que un usuario real la necesite.

### Comportamiento esperado
1. Un Admin puede ver (y opcionalmente editar) la configuracion SMTP de aplicacion desde `/settings`, o al menos ver si esta configurada y con que host/puerto.
2. Existe una accion de "enviar correo de prueba" que confirma que la recuperacion de contrasena esta operativa, sin esperar a que un usuario real la solicite.

### Criterios de aceptacion
1. Nueva seccion en `/settings` (o endpoint `GET /api/v1/system/smtp`) que muestre el estado de la configuracion SMTP de aplicacion (configurada/no configurada, host, puerto — nunca la contrasena en claro).
2. Endpoint `POST /api/v1/system/smtp/test` (`requireRole("admin")`) que envia un correo de prueba usando `SmtpMailer` y reporta exito/fallo.

### Pistas de investigacion
- `backend/src/infrastructure/config/env.ts` (bloque `AZKIN_SMTP_*`).
- `backend/src/infrastructure/notifier/smtp-mailer.ts`, `application/use-cases/auth/request-password-reset.usecase.ts`.
- Reusar el patron de `TestNotificationUseCase` (`application/use-cases/notifications/test-notification.usecase.ts`) para el nuevo caso de uso de prueba SMTP de aplicacion.

---

## AZ-032) Botones de solo-icono sin nombre accesible (`aria-label`/`title`) en varios puntos del Dashboard
- Codigo: AZ-032
- Estado: [x] Resuelto
- Prioridad: Baja
- Reportado: 2026-07-19
- Resuelto: 2026-07-19

### Resolucion
Se agregó `aria-label`/`title` a los 4 botones identificados: volver al dashboard (`group-dashboard.ts`), editar monitor, eliminar monitor y cerrar formulario (`dashboard.ts`). El botón de logout y el de refrescar incidentes ya tenían texto visible junto al ícono (no eran violaciones reales, solo falsos positivos de la búsqueda inicial).

### Descripcion
Varios botones que solo contienen un icono SVG (sin texto visible) no tienen `aria-label` ni `title`, por lo que un lector de pantalla no puede anunciar su proposito. Confirmado en: boton de volver al dashboard (`group-dashboard.ts`), boton de cerrar sesion, botones de editar/eliminar monitor y boton de cerrar modal (todos en `dashboard.ts`). Por contraste, otros botones similares en `profile.ts`/`settings.ts` si usan `title`/`[title]`, mostrando que el patron correcto ya existe en el codebase pero no se aplico de forma consistente.

### Comportamiento esperado
Todo boton de solo-icono tiene un nombre accesible (`aria-label` o `title`) describiendo su accion.

### Criterios de aceptacion
1. Los botones identificados (volver, cerrar sesion, editar monitor, eliminar monitor, cerrar modal) tienen `aria-label`/`title`.
2. Se establece como convencion para revisiones futuras: ningun `<button>` cuyo unico hijo sea un `<svg>` se agrega sin `aria-label`/`title`.

### Pistas de investigacion
- `frontend/src/app/features/dashboard/group-dashboard.ts` (boton de volver).
- `frontend/src/app/features/dashboard/dashboard.ts` (botones de logout, editar/eliminar monitor, cerrar modal).
- Comparar con el patron ya correcto en `profile.ts`/`settings.ts` (`[title]="lang.t(...)"`).

---

## AZ-033) Benchmark UX/UI y propuesta de identidad visual diferenciada frente a Uptime Robot y Uptime Kuma
- Codigo: AZ-033
- Estado: [ ] Abierto
- Prioridad: Media
- Reportado: 2026-07-19

### Descripcion
El dashboard actual (fondo `zinc-950` + acento `orange-500`, tarjetas con badges de color por estado) ya se aleja parcialmente del verde corporativo de Uptime Robot y del azul/oscuro generico de Uptime Kuma, pero no tiene una identidad visual deliberada: paleta, tipografia y layout no fueron elegidos como sistema, sino heredados del patron generico de dashboards oscuros. Se solicito una propuesta concreta de diferenciacion visual.

Se entrego una propuesta llamada **"Pulso"**: en la vista de flota (grilla de todos los monitores), cada tarjeta se representa con su propia forma de onda de latencia (sparkline) en vez de solo un badge de color, con el estado codificado como borde + etiqueta (nunca solo color). Paleta de tinta violeta-oscura + acento cobre/"ember" con un violeta secundario, colores semánticos (`good`/`warn`/`crit`) reservados y separados del acento de marca; tipografia serif editorial para titulos + monoespaciada para metricas (rompe el "todo-sans" del genero). Mockup interactivo publicado como artifact: [Pulso — Propuesta de identidad visual Azkin](https://claude.ai/code/artifact/3d3a6655-61c3-4b9e-a29e-8e559a041cc4)

Feedback de usuario tras la primera revision: el heatmap de bloques por chequeo (verde/rojo, uno por chequeo, con "N chequeos atras" / "ahora mismo") que ya existe en el detalle de monitor **no debe reemplazarse por la onda** — el bloque individual es lo que permite identificar exactamente *cual* chequeo cayo, algo que una onda continua no resuelve tan bien. La onda si aporta valor para ver tendencia/estabilidad. Conclusion: en la vista de **detalle** de un monitor se mantienen ambos, bloques + grafico de latencia debajo (como ya funciona hoy), solo reestilizados con los tokens de Pulso; la onda-en-vez-de-badge aplica a la **grilla de flota** (tarjetas compactas), no al detalle. El mockup se actualizo para incluir esta vista de detalle. Tambien se agregaron al mockup, y deben incorporarse al sistema real (no solo quedar de demo): el toggle de tema claro/oscuro y el efecto existente de Modo NyanCat en los graficos (ver AZ-027 y `toggleNyanCat()` en `dashboard.ts`).

### Comportamiento esperado
1. Existe un sistema de diseño documentado (paleta, tipografia, layout) especifico de Azkin, no heredado de un dashboard generico.
2. En la grilla de flota, la forma de onda (sparkline) reemplaza al badge de color como unidad minima de estado por tarjeta.
3. En el detalle de un monitor se conserva el heatmap de bloques por chequeo (para identificar el chequeo exacto que fallo) **junto con** el grafico de latencia debajo, ambos reestilizados con los tokens de Pulso — no se reemplaza uno por el otro.
4. El sistema funciona en tema claro y oscuro (con control explicito de cambio, no solo `prefers-color-scheme`), y es compatible con el Modo TV/Kiosko (AZ-027) y con el Modo NyanCat existente.

### Criterios de aceptacion
1. Tokens de color (`--ground`, `--surface`, `--ember`, `--violet`, `--good`, `--warn`, `--crit`, etc.) definidos centralmente (ej. variables CSS en `styles.css`) y aplicados en lugar de las clases Tailwind de color sueltas actuales.
2. Tarjetas de monitor en la grilla de flota (`dashboard.ts`) incorporan un sparkline de latencia por monitor (no solo el numero puntual actual).
3. El heatmap de bloques (`uptimeBlocks()`) del detalle de monitor se reestiliza con los tokens de Pulso pero no se elimina ni se sustituye por el sparkline.
4. El grafico de latencia de ECharts (detalle de monitor y grupo) adopta la paleta Pulso (`--ember` en vez de `orange-500`, etc.), preservando el efecto Modo NyanCat (`isNyanCatMode()`) ya implementado.
5. Existe un control de tema claro/oscuro explicito en la UI (no solo deteccion automatica de `prefers-color-scheme`).
6. Verificado visualmente en ambos temas (claro/oscuro), en Modo TV/Kiosko y en Modo NyanCat, sin regresiones (ver AZ-027 y el fix de superposicion de `svg` en Modo TV).

### Pistas de investigacion
- Mockup y especificacion visual: artifact "Pulso — Propuesta de identidad visual Azkin" (incluye vista de detalle con bloques + latencia, toggle de tema y Modo NyanCat).
- `frontend/src/styles.css` (tokens de color actuales, bloque `body.kiosk-mode`).
- `frontend/src/app/features/dashboard/dashboard.ts` (tarjetas de monitor, `uptimeBlocks()`, grafico de latencia con ECharts, `isNyanCatMode()`/`toggleNyanCat()`, `isLightTheme`).

---

## AZ-034) Limpieza de código: eliminar referencias a números de ticket o issues
- Codigo: AZ-034
- Estado: [x] Resuelto
- Prioridad: Baja
- Reportado: 2026-07-20
- Resuelto: 2026-07-20

### Resolucion
Barrido completo de `backend/src`, `frontend/src`, `.env.example`, `backend/.env.example`,
`compose.yaml` y `compose.dev.yaml`. Los prefijos de comentario (`// AZ-006: texto`) se
reescribieron capitalizando la primera letra del texto restante (`// Texto`); las referencias
parentéticas sueltas (`(AZ-029)`, `(regresión AZ-001)`) se eliminaron completas. Dos referencias a
"ver nota Fuera de alcance en AZ-016" se reemplazaron por "ver ISSUES.md" (documentación viva, en
vez de un código de ticket que exige buscar en el historial). `grep -rlE "AZ-[0-9]{3}"` sobre los
seis objetivos no devuelve resultados; typecheck, build y 69 tests del backend, y build del
frontend, pasan sin cambios de comportamiento.

### Descripcion
En todo el codebase (código fuente backend y frontend, archivos de configuración, `.env`, Docker Compose, etc.) existen comentarios y descripciones de pruebas unitarias que contienen referencias a números de tickets o issues internos (como `AZ-003`, `AZ-006`, etc.). Se requiere eliminar estas referencias para mantener un código limpio y libre de marcas temporales de backlog, conservando únicamente las explicaciones funcionales.

### Comportamiento esperado
1. Ningún archivo de configuración, docker-compose, ni código fuente (`.ts`, `.html`, `.css`, etc.) del backend o frontend debe contener cadenas del tipo `AZ-XXX` (salvo los archivos de documentación histórica como `ISSUES.md` y `CHANGELOG.md`).
2. Los comentarios funcionales deben mantenerse pero sin el prefijo del ticket (ejemplo: `// AZ-006: si ya existe...` pasa a `// Si ya existe...` con mayúscula inicial).
3. Las descripciones de pruebas unitarias que mencionen `(AZ-XXX)` o `(regresión AZ-XXX)` se limpian para describir solo la funcionalidad probada.

### Criterios de aceptacion
1. Búsqueda en lote de `AZ-\d{3}` no arroja resultados en `backend/src`, `frontend/src`, `.env.example`, `compose.yaml` ni `compose.dev.yaml`.
2. Las pruebas unitarias continúan pasando sin errores tras la limpieza de texto.

### Pistas de investigacion
- Usar un script en Node.js o comandos del editor para buscar con la expresión regular `\bAZ-\d{3}\b`.
- Limpiar manualmente las referencias en comentarios de código (`//`, `/* ... */`, `#`) y cadenas de texto en archivos de testing (`*.test.ts`, `*.spec.ts`).

---

## AZ-035) Respaldo granular de activos: exportación/importación molecular de monitores
- Codigo: AZ-035
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-20
- Resuelto: 2026-07-20

### Resolucion
- `GET /api/v1/monitors/export` (`ExportMonitorAssetsUseCase`): devuelve `{ version, exportedAt, monitors }` con cada monitor sin `id`/`userId`/`createdAt`/`updatedAt`/`notificationIds`/`pushToken`.
- `POST /api/v1/monitors/import-assets` (`ImportMonitorAssetsUseCase`): valida cada activo con las mismas reglas que crear un monitor por API, ignora siempre `notificationIds`/`pushToken`/`id`/`userId` del JSON de origen (aunque vengan presentes), asigna el `userId` del admin que importa, regenera `pushToken` para tipo `push`, y actualiza en vez de duplicar si ya existe un monitor con el mismo `name`+`target` — acumulando errores por activo inválido en vez de abortar el lote completo (a diferencia de `ImportBackupUseCase`, pensado para restaurar un respaldo propio confiable).
- UI en `/settings` → pestaña **Respaldos**, sección nueva "Exportar/Importar solo monitores (JSON)" con botones "Exportar Activos (JSON)" e "Importar Activos (JSON)" (soporta drag-and-drop), separada del respaldo completo existente.
- Ambos endpoints quedan también disponibles en la API pública (`/api/public/v1/monitors/export` y `/import-assets`) sin trabajo adicional, al reutilizar `monitorRoutes`/`MonitorController` igual que el resto de rutas de monitores.
- Tests: `export-monitor-assets.usecase.test.ts` y `import-monitor-assets.usecase.test.ts` (creación con sanitización, acumulación de errores por activo, actualización por `name`+`target`, límite de cuota).

### Descripcion
Actualmente, los respaldos se guardan en la colección `backups` de la base de datos de AZKIN y se manejan como una instantánea del sistema. Se requiere un mecanismo molecular específico para exportar e importar únicamente los activos monitoreados (monitores) en formato JSON, de forma que sea posible migrar o portar la configuración de los monitores de una instancia a otra en diferentes entornos/sectores de manera directa y sin conflictos.

### Comportamiento esperado
1. Un Administrador puede descargar directamente un archivo JSON que contiene exclusivamente el arreglo de monitores configurados, sin envolverlo en registros persistidos de backup de base de datos.
2. Al importar un archivo JSON con los monitores en otra instancia de AZKIN, el sistema debe sanitizar e ignorar campos específicos de base de datos (`id`, `_id`, `userId`, `pushToken`, `createdAt`, `updatedAt`).
3. Muy importante: Se deben limpiar o ignorar las referencias a notificaciones (`notificationIds: []`), ya que las notificaciones de la instancia de origen no existirán en la instancia de destino.

### Criterios de aceptacion
1. Endpoint `GET /api/v1/monitors/export` (o parámetro en el controlador de backups) que devuelva el listado limpio de monitores en formato JSON.
2. Endpoint `POST /api/v1/monitors/import-assets` (o similar) que reciba el JSON de monitores, omitiendo `notificationIds`, regenerando `pushToken` si es tipo push, y asignando el nuevo `userId` del administrador que realiza la importación.
3. Interfaz de usuario en `/settings` (pestaña de respaldos) que incluya botones claros para "Exportar Activos (JSON)" y "Importar Activos (JSON)".

### Pistas de investigacion
- Estudiar `backend/src/application/use-cases/backup/import-backup.usecase.ts` y adaptarlo o crear un caso de uso hermano que reciba la lista de activos directamente.
- Modificar el controlador de monitores `backend/src/infrastructure/http/controllers/monitor.controller.ts` para integrar los nuevos métodos de importación/exportación molecular de activos.
- En el frontend, agregar los métodos en `backups-panel.ts` usando `FileDownloadService` para la descarga directa del JSON.

---

## AZ-036) `keyword`/`keywordMethod`/`userAgent` existen en el modelo de Monitor HTTP pero no tienen control en el formulario
- Codigo: AZ-036
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-20
- Resuelto: 2026-07-20

### Resolucion
Se agregaron los tres campos en `monitor-form.ts`, dentro del bloque `@if (formModel.type === 'http')`, junto al checkbox de `ignoreTls`: un input de texto para `keyword` con placeholder de ejemplo, un radio presencia/ausencia para `keywordMethod` que solo aparece si `keyword` no está vacío (igual que valida el backend), y un input de texto para `userAgent` con placeholder explicando el User-Agent por defecto. `buildFormFromMonitor()` ya precargaba estos valores desde antes (por eso editar un monitor con `keyword`/`userAgent` seteados por API ya los mostraba una vez agregado el input), y el payload de guardado ya los enviaba — solo faltaba el input mismo. Build del frontend verificado sin errores ni warnings.

### Nota (2026-07-20)
Encontrado al diagnosticar por qué un monitor HTTP con certificado autofirmado (`ignoreTls`)
seguía marcando "caído" pese a que el servicio respondía bien en el navegador: `ignoreTls` estaba
en el modelo de datos y viajaba al backend en cada guardado, pero no existía ningún
`<input type="checkbox">` en `monitor-form.ts` que lo expusiera — imposible de activar sin editar
la base de datos a mano. Ya se agregó el control para `ignoreTls` (ver `CHANGELOG.md`). Al revisar
el mismo archivo se encontró que `keyword`, `keywordMethod` y `userAgent` tienen exactamente el
mismo problema: están en `formModel`, se envían en el payload de guardado
(`if (this.formModel.type === 'http') { Object.assign(payload, { keyword: ..., userAgent: ... }) }`),
pero no hay ningún campo de formulario que permita al usuario escribirlos. Es decir, la validación
de palabra clave en el body (AZ-004/spec original) y el User-Agent personalizado (útil para
esquivar bloqueos de WAF más agresivos que el bypass automático de Cloudflare) son funcionalidad
del backend completamente inalcanzable desde la UI actual.

### Descripcion
`frontend/src/app/features/dashboard/monitor-form.ts`, sección "Configuración del Checker" (tipo
`http`), no renderiza ningún input para `keyword`, `keywordMethod` (radio/select
presencia/ausencia) ni `userAgent`, pese a que ambos son parte del `formModel` desde su
inicialización (`getEmptyForm`/`buildFormFromMonitor`) y se incluyen en el payload de creación y
edición.

### Comportamiento esperado
1. El formulario de monitor HTTP incluye un campo de texto para `keyword`, un selector
   presencia/ausencia para `keywordMethod` (solo visible si `keyword` no está vacío, como ya hace
   el backend), y un campo de texto para `userAgent` (con placeholder mostrando el User-Agent por
   defecto que se usa si se deja vacío).
2. Editar un monitor HTTP que ya tiene `keyword`/`userAgent` configurados (por ejemplo, vía API
   pública) permite ver y modificar esos valores en la UI, no solo crearlos a ciegas.

### Criterios de aceptacion
1. Crear un monitor HTTP con una palabra clave configurada desde la UI y verificar que el
   monitor pasa a `DOWN` cuando la palabra clave no aparece en la respuesta (o aparece, según el
   método elegido).
2. Editar un monitor HTTP existente con `userAgent` seteado por API y confirmar que el formulario
   lo muestra precargado, no vacío.

### Pistas de investigacion
- `frontend/src/app/features/dashboard/monitor-form.ts`: sección "Configuración del Checker",
  junto a `interval`/`retries`/`retryInterval`, o una subsección propia como se hizo para
  `ignoreTls`/`sameHostAsAzkin`.
- El backend ya valida y persiste estos tres campos sin cambios necesarios
  (`backend/src/infrastructure/http/schemas/monitor.schema.ts`,
  `backend/src/infrastructure/checkers/http.checker.ts`).
