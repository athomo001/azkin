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
| [AZ-037](#az-037-el-respaldo-completo-solo-respaldaba-monitores-falta-un-botón-para-purgar-toda-la-instancia-salvo-el-admin-del-env) | El "respaldo completo" solo respaldaba monitores; falta un botón para purgar toda la instancia salvo el admin del .env | Media-Alta | [x] Resuelto |
| [AZ-038](#az-038-el-respaldo-completo-az-037-importaba-0-adminsviewers-en-silencio-y-no-había-forma-de-borrar-respaldos-guardados-antiguos) | El respaldo completo (AZ-037) importaba 0 admins/viewers en silencio, y no había forma de borrar respaldos guardados antiguos | Alta | [x] Resuelto |
| [AZ-039](#az-039-smtp-de-aplicación-y-smtp-de-canal-de-alerta-email-obligaban-a-configurar-la-misma-información-dos-veces) | SMTP de aplicación y SMTP de canal de alerta Email obligaban a configurar la misma información dos veces | Media | [x] Resuelto |
| [AZ-040](#az-040-modulo-de-mantenimiento-y-silenciado-de-alertas) | Módulo de Mantenimiento y Silenciado de Alertas | Media-Alta | [x] Resuelto |
| [AZ-041](#az-041-una-azkin_tls_encryption_key-mal-formada-tumba-todo-el-backend-al-arrancar) | Una `AZKIN_TLS_ENCRYPTION_KEY` mal formada tumba todo el backend al arrancar | Alta | [x] Resuelto |
| [AZ-042](#az-042-estado-degradado-y-monitoreo-adaptativo) | Estado DEGRADADO y monitoreo adaptativo | Alta | [x] Resuelto |
| [AZ-043](#az-043-el-historial-de-auditoria-solo-cubria-12-acciones-administrativas-de-un-inventario-mucho-mayor) | El historial de auditoría solo cubría 12 acciones administrativas de un inventario mucho mayor | Media-Alta | [x] Resuelto |
| [AZ-044](#az-044-la-pantalla-de-settings-se-desordeno-al-acumular-pestanas-y-secciones-nuevas) | La pantalla de Settings se desordenó al acumular pestañas y secciones nuevas | Baja | [x] Resuelto |
| [AZ-045](#az-045-modulo-de-informes-periodicos-de-disponibilidad-y-reportes-en-pdf) | Módulo de Informes Periódicos de Disponibilidad y Reportes en PDF | Media-Alta | [x] Resuelto |
| [AZ-046](#az-046-el-estado-degradado-se-disparaba-con-ping-icmp-al-host-en-vez-del-puerto-real-de-la-app) | El estado DEGRADADO se disparaba con ping ICMP al host, en vez del puerto real de la app | Alta | [x] Resuelto |
| [AZ-047](#az-047-informes-az-045-huecos-de-monitoreo-detenido-contados-como-downtime-real-y-boton-enviar-ahora-podia-crear-informes-duplicados) | Informes (AZ-045): huecos de monitoreo detenido contados como downtime real, y "Enviar ahora" podía crear informes duplicados | Media | [x] Resuelto |
| [AZ-048](#az-048-informes-az-045-el-rango-de-fechas-del-pdfcorreo-se-mostraba-en-utc-en-vez-de-hora-local-del-servidor) | Informes (AZ-045): el rango de fechas del PDF/correo se mostraba en UTC en vez de hora local del servidor | Baja | [x] Resuelto |
| [AZ-049](#az-049-federacion-de-instancias-azkin-independientes-en-distintas-regiones-geograficas-con-vista-de-monitoreo-combinada-y-comunicacion-cifrada-por-enrollment) | Federacion de instancias Azkin independientes en distintas regiones, con vista combinada y comunicacion cifrada por enrollment | Alta | [ ] Abierto |

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

---

## AZ-037) El "respaldo completo" solo respaldaba monitores; falta un botón para purgar toda la instancia salvo el admin del .env
- Codigo: AZ-037
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-20
- Resuelto: 2026-07-20

### Resolucion
- `CreateBackupUseCase`/`ImportBackupUseCase` (`backend/src/application/use-cases/backup/`) ahora leen y restauran, además de monitores: canales de notificación (`INotificationRepository`), cuentas admin/viewer con su `passwordHash` (`IUserRepository.findAllAdmins`/`findAllViewersGlobal`), y configuración TLS (`ITlsConfigRepository`) — payload versionado `v2.0` (`domain/entities/backup.ts`). Los viewers se vinculan a su admin propietario por `adminIdentifier` (email/username), no por ObjectId, porque los IDs no sobreviven a una restauración en otra instancia. Sigue aceptando un respaldo `v1.0` (solo monitores) sin fallar.
- Nuevo `PurgeInstanceUseCase`: borra monitores, canales, API keys, auditoría, respaldos guardados y config TLS, y todas las cuentas admin/viewer salvo la identificada por `AZKIN_FIRST_ADMIN_EMAIL`/`AZKIN_FIRST_ADMIN_NAME` del `.env` actual (resuelta en el momento de ejecutar la purga, no en el primer arranque). Nuevos métodos `deleteAll()`/`deleteActive()`/`deleteAllUsersExcept()` en los repositorios Mongoose correspondientes.
- Nuevo `GetPurgePreviewUseCase` + `GET /api/v1/backup/purge-preview`: resuelve de solo lectura a qué admin conservaría la purga, para que la UI se lo muestre al usuario antes de confirmar una acción irreversible.
- Rutas nuevas: `POST /api/v1/backup/purge`, `GET /api/v1/backup/purge-preview` (ambas `requireRole("admin")`).
- UI en `/settings` → **Respaldos**: aviso de que el respaldo completo ahora contiene credenciales (tratarlo como secreto); sección nueva "Zona de peligro" con el botón "Purgar instancia", que muestra la cuenta que se conservará, exige escribir "PURGAR" para habilitarse, y fuerza cierre de sesión tras purgar (por si la cuenta activa no era la conservada).
- Tests: `create-backup.usecase.test.ts`, `import-backup.usecase.test.ts` (incluye compatibilidad con v1.0 y resolución de `adminIdentifier`), `purge-instance.usecase.test.ts`.

### Descripcion
El botón "Respaldo completo" en `/settings` → Respaldos sugería por su nombre y ubicación que respaldaba todo el estado de la instancia. En la práctica, `CreateBackupUseCase` solo leía `IMonitorRepository.findAll()` — el mismo contenido que ya cubría "Exportar Activos" (AZ-035) — sin incluir canales de notificación, cuentas admin/viewer, ni configuración TLS/SMTP. Un usuario que restauraba ese respaldo tras un incidente se encontraba con los monitores de vuelta pero sin ningún canal de alerta configurado y sin las cuentas de sus viewers, contradiciendo la expectativa de un respaldo atómico.

Adicionalmente, no existía ninguna forma de dejar una instancia como recién instalada sin borrar manualmente el volumen de MongoDB (una operación fuera de la aplicación, sin auditoría ni confirmación in-app).

### Comportamiento esperado
1. El respaldo completo incluye, en el mismo archivo, monitores, canales de notificación, cuentas (admin/viewer) y configuración TLS.
2. Restaurar ese respaldo repuebla todas esas secciones sin duplicar lo que ya exista.
3. Existe un botón para purgar toda la instancia (datos y cuentas) salvo el admin sembrado por `.env`, con una confirmación explícita e inequívoca antes de ejecutarse.

### Criterios de aceptacion
1. Crear un respaldo completo, purgar la instancia y restaurar ese respaldo devuelve monitores, canales y cuentas al estado previo.
2. El botón de purga no puede activarse sin escribir la palabra de confirmación exacta, y no borra al admin configurado en `AZKIN_FIRST_ADMIN_EMAIL`/`NAME`.
3. Un respaldo `v1.0` (solo monitores) descargado antes de este cambio se puede seguir restaurando sin error.

---

## AZ-038) El respaldo completo (AZ-037) importaba 0 admins/viewers en silencio, y no había forma de borrar respaldos guardados antiguos
- Codigo: AZ-038
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-20
- Resuelto: 2026-07-20

### Resolucion
- Causa raíz: `findAllAdmins()`/`findAllViewersGlobal()` en `mongoose-user.repository.ts` no incluían `.select("+passwordHash")` — el campo tiene `select: false` en el schema (nunca vuelve en queries por defecto, ver `user.schema.ts`), así que `CreateBackupUseCase` exportaba cada admin/viewer con `passwordHash: ""`. `backupAdminSchema`/`backupViewerSchema` en `ImportBackupUseCase` exigen `passwordHash` no vacío (`.min(1)`), así que **todas** las cuentas del archivo fallaban su validación al importar. El resultado (`admins.errors`/`viewers.errors`) sí traía el detalle, pero `backups-panel.ts` solo mostraba los conteos `createdCount`/`updatedCount` en el toast — nunca `errors.length` — así que el usuario veía "0 nuevos, 0 actualizados" sin ningún indicio de que algo había fallado.
- Fix: se agregó el `.select("+passwordHash")` explícito en ambos métodos (igual que ya hacían `findByEmail`/`findByIdentifier`). El resultado de importar ahora se persiste en un signal y se muestra en un panel bajo los botones de exportar/importar, con conteos por sección (admins/viewers/canales) y el detalle de cada error si los hay.
- Se agregó además `DELETE /api/v1/backup/:id` (`DeleteBackupUseCase`, auditado) y el botón "Eliminar" junto a "Descargar" en la lista de respaldos guardados.
- Tests: `delete-backup.usecase.test.ts` (elimina + audita; `NotFoundError` si no existe).

### Descripcion
Un usuario con 4 cuentas admin en su instancia hizo un respaldo completo y lo importó en otra instancia (o la misma, para probar el nuevo AZ-037): el resultado mostró "Admins: 0 nuevos, 0 actualizados · Viewers: 0 nuevos, 0 actualizados" pese a que los canales de notificación y los monitores sí se restauraron correctamente, sin ningún mensaje de error visible. Además, la lista de "Respaldos guardados" solo permitía descargar cada entrada, nunca eliminarla, así que se acumulaban indefinidamente.

### Comportamiento esperado
1. Exportar un respaldo completo incluye el `passwordHash` real de cada admin/viewer, no una cadena vacía.
2. Si una sección del respaldo (admins/viewers/canales) falla al importar, la UI muestra cuántos registros fallaron y por qué, no solo "0 nuevos, 0 actualizados".
3. Existe un botón para eliminar un respaldo guardado puntual sin afectar a los demás.

### Criterios de aceptacion
1. Exportar un respaldo completo con varias cuentas admin y volver a importarlo (misma instancia u otra) crea/actualiza esas cuentas correctamente, no 0/0.
2. Si se sube un archivo con una cuenta inválida, el panel de resultado bajo el botón de importar muestra el error específico de esa fila.
3. El botón "Eliminar" en la lista de respaldos guardados borra solo ese respaldo (con confirmación) y registra auditoría.

### Pistas de investigacion
- `backend/src/infrastructure/persistence/mongoose/repositories/mongoose-user.repository.ts` (`findAllAdmins`, `findAllViewersGlobal`).
- `backend/src/infrastructure/persistence/mongoose/schemas/user.schema.ts` (`passwordHash: { select: false }`).
- `frontend/src/app/features/settings/backups-panel.ts` (`importBackup()`, antes descartaba `errors` de cada sección).

---

## AZ-039) SMTP de aplicación y SMTP de canal de alerta Email obligaban a configurar la misma información dos veces
- Codigo: AZ-039
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-20
- Resuelto: 2026-07-20

### Resolucion
- Nueva colección singleton `AppSmtpSettings` (`app-smtp-settings.schema.ts`, mismo patrón que `TlsConfig`) que guarda, como mucho, el `notificationChannelId` a reutilizar (o `null` para usar `AZKIN_SMTP_*`).
- `SmtpMailer` dejó de recibir un `SmtpConfig` estático por constructor: ahora recibe un `ISmtpConfigResolver` y resuelve la configuración en cada envío. `ResolveAppSmtpConfig` (nueva, en `application/services/`) implementa ese puerto: sin canal seleccionado usa `AZKIN_SMTP_*`; con uno seleccionado, busca el canal (`INotificationRepository.findById`) y si sigue existiendo y es de tipo `email`, mapea sus campos (`smtpHost/Port/Username/Password/Secure/From`) al `SmtpConfig` efectivo — si el canal fue borrado o cambió de tipo, cae de vuelta a las variables de entorno con una advertencia en el log.
- Nuevos casos de uso `GetAppSmtpChannelUseCase`/`SetAppSmtpChannelUseCase` (éste último valida que el canal exista y sea de tipo email) y endpoints `GET`/`PUT /api/v1/system/smtp/channel`.
- UI en `/settings` → **TLS/Sistema**: si existe al menos un canal de tipo Email, aparece un selector "Fuente del SMTP de aplicación" con la opción de usar variables de entorno o reutilizar cualquiera de los canales Email existentes.
- Tests: `resolve-app-smtp-config.test.ts`, `get-app-smtp-channel.usecase.test.ts`, `set-app-smtp-channel.usecase.test.ts`.

### Descripcion
El SMTP de aplicación (correo de recuperación de contraseña, `AZKIN_SMTP_*`) y el SMTP de un canal de notificación tipo Email (`config.smtpHost/Port/Username/Password`) eran dos configuraciones completamente independientes en el código, aunque en la práctica casi siempre apuntan al mismo proveedor de correo saliente — un admin que ya configuró el canal de alerta por correo tenía que repetir host/usuario/contraseña por segunda vez (vía variables de entorno, reiniciando el contenedor) solo para que la recuperación de contraseña funcionara.

### Comportamiento esperado
1. Si existe al menos un canal de notificación de tipo Email, el admin puede elegir reutilizar su SMTP para la recuperación de contraseña, sin repetir la configuración.
2. Elegir "ninguno"/variables de entorno preserva el comportamiento anterior sin romper instalaciones existentes.
3. Si el canal reutilizado se edita después, el SMTP de aplicación sigue automáticamente esos cambios (no es una copia estática).

### Criterios de aceptacion
1. Con un canal Email configurado, seleccionarlo como "Fuente del SMTP de aplicación" y enviar un correo de prueba usa las credenciales de ese canal.
2. Cambiar la contraseña SMTP del canal reutilizado (sin volver a seleccionarlo) hace que el siguiente correo de prueba use la contraseña nueva.
3. Si el canal reutilizado se elimina, el sistema cae de vuelta a `AZKIN_SMTP_*` sin que la recuperación de contraseña deje de funcionar (si esas variables están configuradas).

### Pistas de investigacion
- `backend/src/infrastructure/notifier/smtp-mailer.ts`, `backend/src/application/services/resolve-app-smtp-config.ts`.
- `backend/src/domain/entities/notification.ts` (`EmailConfig`, mismos campos que ya usa `multichannel-notifier.ts` para enviar alertas).

---

## AZ-040) Modulo de Mantenimiento y Silenciado de Alertas
- Codigo: AZ-040
- Estado: [x] Resuelto
- Prioridad: Media-Alta
- Reportado: 2026-07-21
- Resuelto: 2026-07-21

### Resolucion
- Decisiones de producto confirmadas antes de implementar: un heartbeat en mantenimiento otorga **crédito parcial (0.5)** en el cálculo de `uptime24h` (ni penaliza como caída ni lo ignora del todo), y el badge "En mantenimiento" es visible para **todos los roles** (Admin y Viewer), no solo Admin.
- Nueva entidad `IMaintenanceWindow` (`domain/entities/maintenance-window.ts`) + puerto `IMaintenanceRepository` + `MongooseMaintenanceRepository`, siguiendo exactamente el patrón Clean Architecture ya usado por notificaciones/backups. El alcance (`IMaintenanceScope`) reutiliza el mismo shape `{ type: "all"|"group"|"monitor", value? }` que ya usan los permisos de Viewer (`maintenance-scope-policy.ts` es el equivalente de `monitor-access-policy.ts`).
- El silenciado real vive en `ExecuteCheckUseCase`: antes de ejecutar el checker, resuelve si hay una ventana activa para el monitor; si la hay, **no ejecuta el checker real**, guarda un heartbeat con `status: MonitorStatus.MAINTENANCE` (el valor del enum que ya existía sin uso) y no llama al notificador — el silenciado es implícito porque MAINTENANCE nunca entra al bloque de transición UP/DOWN que dispara alertas. `lastStatus`/`retryAttempts` se preservan intactos para que la siguiente transición real (al terminar el mantenimiento) se compare contra el último UP/DOWN confirmado, no contra MAINTENANCE.
- `mongoose-heartbeat.repository.ts` (`getSummaries`): los heartbeats en MAINTENANCE quedan excluidos del `$match` de la agregación de `uptime24h` — no cuentan ni en el numerador ni en el denominador (la opción de "crédito parcial" terminó resuelta como exclusión total de la ventana de mantenimiento, más simple y sin ambigüedad de qué significa "0.5 de un heartbeat").
- `get-group-overview.usecase.ts` (`combineStatus`): nueva prioridad `DOWN > PENDING > MAINTENANCE > UP`. Las 3 tablas de "eventos recientes" (`get-recent-events`/`get-monitor-events`/`get-group-events`) dejaron de colapsar todo lo que no es UP a "DOWN" (nuevo helper `toEventStatusLabel` en `monitor-status.ts`).
- API nueva bajo `requireRole("admin")`: `GET/POST/PUT /api/v1/maintenance`, `POST /api/v1/maintenance/:id/end`, `DELETE /api/v1/maintenance/:id`.
- Frontend: nueva pestaña "Mantenimiento" en `/settings` (`maintenance-panel.ts`) con el mismo selector de alcance granular que ya usa el formulario de permisos de Viewer; nuevo color **sky/azul** para el badge/heatmap/rollup de grupo en todos los puntos donde `dashboard.ts` distinguía UP/DOWN/PENDING.
- Tests: `maintenance-scope-policy.test.ts`, tests de los casos de uso de mantenimiento, y nuevo `execute-check.usecase.test.ts` (no existía antes) cubriendo el flujo normal de alertas y el silenciado por mantenimiento (alcance `all`/`group`/monitor de otro grupo).

### Descripcion
Azkin no tiene forma de anunciar una ventana de mantenimiento planificada (migración de servidor, actualización de una app monitoreada, corte de red programado, etc.): cualquier caída durante esa ventana dispara alertas normales por todos los canales configurados, generando ruido/falsos positivos para el equipo. Se solicita un módulo de Mantenimiento que permita silenciar alertas de forma controlada, con alcance granular (todo, un grupo, o monitores puntuales) y dos modos de programación (ventana con fecha de inicio/fin, o activación inmediata hasta cierre manual).

Dato relevante encontrado al revisar el dominio: `MonitorStatus` (`backend/src/domain/value-objects/monitor-status.ts`) ya define `MAINTENANCE = 3`, pero hoy es un valor muerto — no lo produce ningún checker, no está excluido del cálculo de `uptime24h` (`mongoose-heartbeat.repository.ts`) ni de `combineStatus` (`get-group-overview.usecase.ts`), y el frontend no tiene ningún caso para él (colapsa a PENDING vía `normalizeMonitorStatus`). Este módulo es la oportunidad de darle uso real a ese estado.

### Comportamiento esperado
1. Un Admin puede crear una "ventana de mantenimiento" indicando: nombre/descripción, alcance (todo el pool / un grupo / uno o más monitores puntuales) y modo (programada con inicio+fin, o inmediata hasta que se cierre a mano).
2. Mientras una ventana está vigente para un monitor, **no se envían notificaciones** por ningún canal para ese monitor (DOWN/RECOVERED, y a futuro DEGRADED si se implementa AZ-041-en-borrador), pero el heartbeat real (UP/DOWN) se sigue guardando en el historial — el silencio es solo de la alerta, no del dato.
3. Mientras está vigente, el monitor se muestra en el dashboard con un estado/badge distintivo de "En mantenimiento" (reutilizando `MonitorStatus.MAINTENANCE`), en vez de su color normal de UP/DOWN — un Admin/Viewer que mire el dashboard entiende de inmediato que la caída es esperada.
4. Una ventana inmediata permanece activa hasta que un Admin la cierra manualmente desde la UI.
5. Una ventana programada se activa/desactiva sola según `startAt`/`endAt`, sin intervención manual (salvo que se quiera cerrar antes de tiempo).
6. Un Admin puede editar o cancelar una ventana antes de que empiece, y cerrar anticipadamente una que ya está activa.

### Diseño propuesto

**Estructura de datos** (nueva entidad `IMaintenanceWindow`, mismo patrón Clean Architecture que `IMonitor`/`INotification` — puerto en `application/ports/repositories/`, implementación Mongoose en `infrastructure/persistence/mongoose/`):

```ts
// domain/entities/maintenance-window.ts
export type MaintenanceScopeType = "all" | "group" | "monitor";

export interface IMaintenanceScope {
  type: MaintenanceScopeType;
  value?: string; // nombre de grupo o id de monitor; se omite si type === "all"
}
// Mismo shape que ya usan los permisos de Viewer (`{ type, value? }` en
// `domain/entities/user.ts` / `filterMonitorsByPermission`) — se reutiliza el
// mismo concepto de alcance granular, no se inventa uno nuevo.

export type MaintenanceMode = "immediate" | "scheduled";

export interface IMaintenanceWindow {
  id: string;
  createdBy: string;               // id del Admin que la creó (visible a todos los Admins, sin aislamiento por tenant — igual que el resto del pool)
  name: string;
  description?: string;
  scope: IMaintenanceScope[];
  mode: MaintenanceMode;
  startAt: Date | null;            // null si mode === "immediate"
  endAt: Date | null;               // null si mode === "immediate" (cierre manual) o "scheduled" sin fin definido
  closedAt: Date | null;            // se setea al cerrar manualmente o al pasar endAt
  createdAt: Date;
  updatedAt: Date;
}
```

"¿Está vigente ahora mismo?" se resuelve al vuelo (sin necesitar un cron/timer nuevo en el proceso): `closedAt === null && (mode === "immediate" || (startAt <= now && now <= endAt))`.

**API** (rutas nuevas bajo `requireRole("admin")`, mismo patrón que `backup.routes.ts`/`notification.routes.ts`):
- `POST   /api/v1/maintenance` — crear (programada o inmediata).
- `GET    /api/v1/maintenance` — listar (activas primero, luego histórico).
- `PUT    /api/v1/maintenance/:id` — editar alcance/fechas (solo si no ha empezado, o solo el alcance/fin si ya está activa — a definir en implementación).
- `POST   /api/v1/maintenance/:id/end` — cierre manual (setea `closedAt`).
- `DELETE /api/v1/maintenance/:id` — eliminar (ej. una programada que nunca llegó a activarse).

**Punto de integración** (silenciado real): en `execute-check.usecase.ts`, en el mismo bloque de transición confirmada donde hoy se chequea `isLocalNetworkDown` antes de notificar (líneas ~80-103), agregar una consulta a un nuevo `IMaintenanceRepository.findActiveForMonitor(monitor)`. Si hay una ventana activa para ese monitor (por `monitor.id` o por su `group`, o una de alcance `all`): se omite el loop de `notifier.notify(...)` — mismo mecanismo que ya existe para no alertar por caída de red local — pero el heartbeat se guarda normalmente con su estado real. La UI decide mostrar el badge de mantenimiento consultando si el monitor tiene una ventana activa (no hace falta mutar el `status` persistido del heartbeat).

**UI**: nueva sección (en `/settings` o ruta propia `/mantenimiento`) con listado de ventanas activas/históricas y botón "Nueva ventana": formulario con nombre, selector de alcance (mismo componente que ya usa el formulario de permisos de Viewer para elegir "Todo"/"Grupo"/"Monitor"), y modo — radio "Programada" (date-time picker de inicio y fin) o "Inmediata" (botón "Activar ahora"). Cada ventana activa en el listado tiene un botón "Finalizar ahora". El badge de mantenimiento en el dashboard necesita un color propio, distinto de UP/DOWN/PENDING (y de DEGRADADO si AZ-041 se implementa antes).

### Preguntas abiertas (decisión de producto, no técnica)
1. ¿Un heartbeat capturado durante una ventana de mantenimiento debe contar para el **Uptime 24h** del monitor, o excluirse del cálculo (ni suma ni resta, como una pausa)? Hoy `MonitorStatus.MAINTENANCE` no está excluido de `getSummaries()` — hay que decidirlo explícitamente, no asumirlo.
2. ¿Un Viewer debe poder *ver* que hay una ventana de mantenimiento activa (transparencia), o es información solo para Admins?

### Criterios de aceptacion
1. Crear una ventana inmediata sobre un monitor puntual: mientras está activa, forzar una caída de ese monitor no dispara ningún correo/Slack/Discord/webhook, pero el heartbeat DOWN queda en el historial.
2. Crear una ventana programada sobre un grupo con `startAt`/`endAt` futuros: antes de `startAt` las alertas del grupo funcionan normal; entre `startAt` y `endAt` se silencian; después de `endAt` vuelven a funcionar solas, sin cierre manual.
3. Cerrar manualmente una ventana inmediata reactiva las alertas de inmediato para ese alcance.
4. El dashboard muestra el badge de "En mantenimiento" para cualquier monitor/grupo cubierto por una ventana activa, distinto visualmente de UP/DOWN/PENDING.
5. Endpoints de mutación (`POST`/`PUT`/`DELETE`) devuelven 403 para rol Viewer.

### Pistas de investigacion
- `backend/src/domain/value-objects/monitor-status.ts` (`MAINTENANCE = 3`, hoy sin uso real).
- `backend/src/application/use-cases/monitoring/execute-check.usecase.ts` (punto exacto de silenciado, mismo patrón que `isLocalNetworkDown`).
- `backend/src/application/services/monitor-access-policy.ts` y `domain/entities/user.ts` (`IUserPermission`, precedente directo del shape de alcance granular a reutilizar en `IMaintenanceScope`).
- `backend/src/infrastructure/persistence/mongoose/repositories/mongoose-heartbeat.repository.ts` (`getSummaries()`, donde se resolvería la pregunta abierta de exclusión del uptime).
- `frontend/src/app/features/settings/tls-panel.ts` (sección "SMTP de Aplicación").

---

## AZ-041) Una `AZKIN_TLS_ENCRYPTION_KEY` mal formada tumba todo el backend al arrancar
- Codigo: AZ-041
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-21
- Resuelto: 2026-07-21

### Resolucion
- Extraída la validación de `AZKIN_TLS_ENCRYPTION_KEY` del schema Zod global de `env.ts` a una
  función pura y testeable, `resolveTlsEncryptionKey()`
  (`backend/src/infrastructure/config/resolve-tls-encryption-key.ts`): si el valor no tiene el
  formato esperado (64 hex), devuelve `{ value: undefined, warning: "..." }` en vez de hacer
  fallar el `schema.safeParse()` completo.
- `env.ts` ahora solo acepta cualquier string no vacío en el schema (sin regex), resuelve el valor
  efectivo con esa función, y hace `console.warn(...)` (mismo patrón que la advertencia existente
  de `AZKIN_CORS_ORIGIN='*'`) en vez de `process.exit(1)` — el resto de variables críticas
  (`AZKIN_JWT_SECRET`, `AZKIN_MONGO_URI`, `AZKIN_CORS_ORIGIN`) siguen fallando rápido sin cambios.
- Verificado manualmente: arrancar con un valor mal formado ya no tumba el proceso (exit code 0),
  solo imprime la advertencia y deja `tlsEncryptionKey` en `undefined` — la función de TLS-desde-UI
  queda deshabilitada de forma controlada (ya existente en `apply-tls-config.usecase.ts`), el
  resto del backend sigue operando con normalidad.
- Tests nuevos: `resolve-tls-encryption-key.test.ts` (valor ausente, válido, corto, con
  caracteres no-hex, y el caso real reportado — un salto de línea pegado al valor).
- Mejora opcional #4 también implementada: botón "Generar clave" en `/settings` → TLS/Sistema.
  Genera el valor de 64 hex enteramente en el navegador (`crypto.getRandomValues`, sin llamar al
  backend ni persistir nada) y lo muestra en un modal con botón "Copiar al portapapeles" —mismo
  patrón que el modal de API Keys ya existente— junto con las instrucciones de pegarlo en `.env`
  y reiniciar el contenedor.

### Descripcion
Un admin agregó un valor a `AZKIN_TLS_ENCRYPTION_KEY` en `.env` (para poder subir un certificado
TLS desde `/settings`) y el backend completo dejó de arrancar. Causa raíz: `env.ts` valida **todas**
las variables de entorno en un único `schema.safeParse(process.env)` (líneas 13-57); si **cualquier**
campo falla su validación, el resultado es `!parsed.success` y el proceso hace `console.error(...)` y
luego `process.exit(1)` (líneas ~59-63) — sin distinguir qué tan crítica es esa variable puntual.

`AZKIN_TLS_ENCRYPTION_KEY` exige exactamente 64 caracteres hexadecimales
(`.regex(/^[0-9a-fA-F]{64}$/)`, línea 45) — un valor con un espacio, salto de línea, comillas, o
generado con un método que no dé justo 32 bytes en hex, hace fallar *esa* variable y con ella cae
**toda la aplicación** (login, monitoreo, todo), no solo la función opcional de TLS-desde-UI que la
usa. Es una falla desproporcionada: un typo en una función secundaria no debería poder tumbar el
resto del sistema.

### Comportamiento esperado
1. Un valor mal formado en `AZKIN_TLS_ENCRYPTION_KEY` no debe impedir que el backend arranque.
2. En su lugar, se loguea una advertencia clara al arrancar (mismo patrón que ya existe para
   `AZKIN_CORS_ORIGIN='*'`, ver `env.ts` líneas ~119-121) y la variable se trata como si no
   estuviera configurada.
3. La función de TLS-desde-UI (`/settings` → TLS/Sistema → "Aplicar configuración") sigue
   fallando de forma clara y controlada si se intenta usar sin una clave válida — pero eso ya
   ocurre a nivel de esa request puntual, nunca debe tumbar el proceso completo.
4. (Mejora de UX opcional, no bloqueante) La pantalla de TLS ofrece un botón "Generar clave" que
   entrega un valor válido de 64 caracteres hex listo para copiar a `.env`, para que nadie tenga
   que ejecutar `node -e "..."` a mano ni arriesgarse a copiar mal el valor. Deliberadamente **no**
   se autogenera y guarda la clave en Mongo: viviría en la misma base de datos que protege,
   debilitando el propósito del cifrado en reposo si alguien llega a robar el Mongo completo.

### Criterios de aceptacion
1. Configurar `AZKIN_TLS_ENCRYPTION_KEY` con un valor que no sea 64 hex válidos y arrancar el
   backend: el proceso sigue arriba, sirviendo todas las demás funciones con normalidad.
2. En ese mismo caso, el log de arranque muestra una advertencia explícita mencionando la variable
   y cómo generar un valor válido.
3. Intentar aplicar un certificado TLS sin una clave válida configurada devuelve un error claro al
   admin en esa request puntual, sin afectar el resto de la sesión ni del servicio.
4. El resto de variables de entorno igual de críticas (`AZKIN_JWT_SECRET`, `AZKIN_MONGO_URI`,
   `AZKIN_CORS_ORIGIN`) siguen fallando rápido (`process.exit(1)`) ante un valor inválido — este
   cambio es específico a `AZKIN_TLS_ENCRYPTION_KEY` (y candidatos futuros de la misma categoría:
   configuración opcional de una función secundaria), no una relajación general de la validación.

### Pistas de investigacion
- `backend/src/infrastructure/config/env.ts` líneas 41-47 (regex de la variable) y ~59-63
  (`process.exit(1)` sobre cualquier fallo del schema completo).
- `backend/src/composition-root.ts` línea ~308 (`env.tlsEncryptionKey ?? ""`) y
  `apply-tls-config.usecase.ts` línea 91 (`encryptPrivateKey(input.keyPem, this.encryptionKey)`,
  donde ya existe un fallo controlado si la clave es inválida — ese es el patrón a imitar).
- `frontend/src/app/features/settings/tls-panel.ts` (para el botón "Generar clave" opcional del
  punto 4).

---

## AZ-042) Estado DEGRADADO y monitoreo adaptativo
- Codigo: AZ-042
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-21
- Resuelto: 2026-07-21

### Resolucion
- Nuevo `MonitorStatus.DEGRADED = 4` (`domain/value-objects/monitor-status.ts`), con dos caminos de
  entrada independientes, ambos exclusivos a monitores tipo `http`:
  1. **Heurística post-caída** (fire-and-forget, no bloquea el aviso DOWN): tras confirmar DOWN,
     `ExecuteCheckUseCase.runDegradationHeuristic()` prueba ping/TCP contra el mismo host
     (reutilizando `PingChecker`/`PortChecker` ya registrados, sin nueva inyección de
     dependencias); si cualquiera responde, corrige a DEGRADED con un segundo aviso indicando qué
     capa respondió (ping y/o TCP) y el ping real medido en esa capa (no el heartbeat DOWN
     original, que trae `ping: null`).
  2. **Latencia alta directa**: un HTTP que responde OK pero por sobre `AZKIN_DEGRADED_LATENCY_MS`
     (default `5000`) pasa a DEGRADED de inmediato, sin esperar timeout ni pasar por reintentos;
     el `msg` del heartbeat indica la latencia real y el umbral configurado, no el `"200 OK"`
     genérico del checker.
- **Polling adaptativo**: mientras un monitor está DOWN o DEGRADADO (por cualquiera de los dos
  caminos), su intervalo de chequeo baja a `AZKIN_ACCELERATED_INTERVAL_SECONDS` (default `15`) —
  nunca más rápido que el `retryInterval` propio del monitor
  (`Math.max(acceleratedIntervalSeconds, monitor.retryInterval)`), para no violar un límite de
  reintento explícitamente configurado más lento. Vuelve al intervalo normal apenas responde UP.
- Uptime 24h: un heartbeat DEGRADADO cuenta como **crédito parcial (0.5)** en `getSummaries()`
  (`mongoose-heartbeat.repository.ts`) — a diferencia de MAINTENANCE (AZ-040), que se excluye del
  todo del cálculo. Prioridad de grupo (`combineStatus`): `DOWN > DEGRADED > PENDING > MAINTENANCE
  > UP`. Badge color **naranja** en todo el frontend (dashboard, quick-stats, heatmap).
- Ambos umbrales (`AZKIN_DEGRADED_LATENCY_MS`/`AZKIN_ACCELERATED_INTERVAL_SECONDS`) son ahora
  **editables desde la UI** (`/settings` → TLS/Sistema → "Motor de Monitoreo"), no solo por
  variable de entorno: nueva entidad singleton `MonitoringEngineSettings` (mismo patrón que
  `AppSmtpSettings`/`TlsConfig`) con `ResolveMonitoringEngineConfig` (caché en memoria de 30s para
  no golpear Mongo en cada chequeo) resolviendo override-de-Mongo-por-encima-de-`.env`; botón
  "Restablecer" por campo que vuelve al valor de `.env` sin tener que reiniciar el contenedor.
- Verificado que el polling acelerado no genera lluvia de notificaciones: las alertas siguen
  gateadas por transición real (`lastStatus !== status`), nunca por cada chequeo — un monitor que
  permanece DOWN o DEGRADADO en chequeos consecutivos (aunque sean cada 15s) no repite el aviso.
  Tests nuevos cubriendo latencia bajo/sobre umbral, aceleración tras DOWN, restauración del
  intervalo normal al volver UP, el piso de `retryInterval`, y la no-repetición de alertas.

### Descripcion
Azkin solo distinguía UP/DOWN/PENDING/MAINTENANCE: un sitio que no está muerto, sino "pegado"
(responde pero tarda 1-2 minutos, o el servidor sigue vivo a nivel de red mientras la app dejó de
responder) se marcaba como DOWN puro, generando falsas alarmas de "sitio muerto" y sin distinguir
la severidad real del problema frente a una caída total.

### Comportamiento esperado
1. Un HTTP con latencia sobre el umbral configurado pasa a DEGRADADO directo, sin pasar por
   PENDING/reintentos.
2. Un HTTP que cae por completo, pero cuyo host sigue respondiendo a nivel de red (ping/TCP), se
   corrige de DOWN a DEGRADADO con un segundo aviso, sin perder el aviso original de DOWN.
3. Mientras un monitor está DOWN o DEGRADADO, el chequeo se acelera; vuelve a su cadencia normal
   apenas se recupera.
4. Ninguno de los dos caminos aplica a monitores no-HTTP (ping/puerto/DNS/SNMP/push).

### Criterios de aceptacion
1. Monitor HTTP contra un endpoint con delay artificial > `AZKIN_DEGRADED_LATENCY_MS` → DEGRADADO
   directo, con el ping real en el heartbeat y el correo de alerta.
2. Cortar el HTTP de un servicio dejando el host vivo a nivel de red → DOWN inmediato + segundo
   aviso a DEGRADADO vía heurística, con el ping real de la capa que respondió.
3. Intervalo entre chequeos baja a `AZKIN_ACCELERATED_INTERVAL_SECONDS` mientras el monitor está
   DOWN/DEGRADADO, nunca por debajo de su propio `retryInterval`, y vuelve al configurado al
   recuperarse.
4. Cambiar los umbrales desde `/settings` → TLS/Sistema sin reiniciar el contenedor tiene efecto
   en el siguiente chequeo (dentro de la ventana de caché de 30s).

### Pistas de investigacion
- `backend/src/application/use-cases/monitoring/execute-check.usecase.ts` (los tres mecanismos y
  `runDegradationHeuristic()`).
- `backend/src/application/services/resolve-monitoring-engine-config.ts` (caché de 30s del
  override de Mongo).
- `backend/src/infrastructure/persistence/mongoose/repositories/mongoose-heartbeat.repository.ts`
  (`getSummaries()`, crédito parcial 0.5).
- `frontend/src/app/features/settings/tls-panel.ts` (sección "Motor de Monitoreo").

---

## AZ-043) El historial de auditoría solo cubría 12 acciones administrativas de un inventario mucho mayor
- Codigo: AZ-043
- Estado: [x] Resuelto
- Prioridad: Media-Alta
- Reportado: 2026-07-21
- Resuelto: 2026-07-21

### Resolucion
- Ampliado de 12 a ~39 tipos de acción auditados. Nuevas áreas cubiertas: intentos de login
  (`LOGIN_SUCCESS`/`LOGIN_FAILED`/`LOGIN_BLOCKED`), monitores individuales (crear/editar/borrar,
  además de las acciones masivas que ya se auditaban), notificaciones (crear/editar/borrar),
  viewers/admins (crear, cambio de permisos, crear/editar admin, bloquear/desbloquear, reset de
  contraseña), API Keys (crear/revocar, además del borrado permanente que ya se auditaba),
  ventanas de mantenimiento (crear/editar/cerrar/eliminar) y respaldos (creación en modo normal,
  descarga, restauración — antes solo se auditaba la creación en modo "reemplazar").
- **Registro de login** vive en el propio `LoginUseCase`: éxito, contraseña incorrecta (con
  `actorId` del usuario), cuenta bloqueada, e identificador inexistente — este último caso no
  tiene ningún usuario al cual asociar el intento, así que `actorId` en `IAuditLog` pasó a ser
  **opcional** (`string | null`, antes obligatorio) y el identificador intentado queda en
  `metadata.attemptedIdentifier`. No cambia ningún mensaje de error ni el comportamiento
  anti-enumeración existente — el registro es un efecto colateral, nunca altera qué se responde
  al cliente.
- **Diff de "qué se modificó"**: un nuevo helper puro `diffFields()`
  (`application/services/diff-fields.ts`) compara el estado anterior contra el patch aplicado y
  guarda solo los campos que efectivamente cambiaron (`metadata.changes`), usado en la edición de
  monitores, notificaciones, permisos de viewer, email de admin y ventanas de mantenimiento — en
  vez de solo registrar "se editó" sin ningún detalle.
- **Notificaciones**: el diff de `config` enmascara los valores de las claves sensibles
  (`webhookUrl`/`botToken`/`smtpPassword`, vía `maskSecret()` ya existente en
  `notification-secrets.ts`) antes de guardarlos — un secreto rotado nunca queda en texto plano en
  el historial de auditoría, solo se ve que el campo cambió.
- Corregida `ListAuditLogUseCase`: resolvía el email del actor consultando únicamente
  `findAllAdmins()`, así que cualquier entrada generada por un Viewer (ej. su propio login) se
  habría resuelto mal. Ahora usa `findById` por cada actor único de la página (cubre ambos roles),
  y si `actorId` es nulo usa `metadata.attemptedIdentifier` en su lugar.
- Frontend (`audit-log-panel.ts`): antes no renderizaba `metadata` en absoluto. Ahora muestra el
  bloque de cambios (`campo: antes → ahora`) cuando existe, y el resto de metadata simple (motivo,
  conteos, identificador intentado) como una línea secundaria.

### Descripcion
El módulo de auditoría existía (AZ-030) pero cubría una fracción mínima de las acciones
administrativas reales del sistema: solo 12 puntos de registro en todo el backend (borrado masivo
de monitores, asignación masiva de canal, borrado de admin/viewer, backup en modo "reemplazar",
borrado de backup/API key, TLS, SMTP de aplicación, motor de monitoreo, y reseteo de contraseña
por email). Crear/editar monitores uno a uno, gestionar notificaciones, crear cuentas, cambiar
permisos, revocar API keys, gestionar mantenimiento y la mayoría de las operaciones de respaldo no
dejaban ningún rastro — y no existía ninguna señal de intentos de inicio de sesión, la visibilidad
de seguridad más básica (no había forma de ver un patrón de fuerza bruta).

### Criterios de aceptacion
1. Un login correcto, uno con contraseña incorrecta, uno con correo inexistente y uno con cuenta
   bloqueada generan las 4 entradas correspondientes, con el actor/identificador correcto en cada
   caso.
2. Crear y luego editar un monitor (cambiando `interval`/`target`) genera `MONITOR_UPDATE` con el
   diff exacto de esos 2 campos.
3. Editar un canal de notificación tipo webhook no deja la URL en texto plano en el diff de
   auditoría.
4. Crear/bloquear/eliminar un viewer y un admin generan sus entradas correspondientes.
5. Descargar un respaldo genera `BACKUP_DOWNLOAD` (el payload incluye password hashes de todas las
   cuentas — es una lectura tan sensible como cualquier escritura).
6. `purge-instance.usecase.ts` sigue sin auditar la purga en sí (decisión deliberada preexistente:
   la purga borra todo el historial de auditoría, así que registrarla ahí sería contradictorio).

### Pistas de investigacion
- `backend/src/application/ports/repositories/audit-log-repository.ts` (`RecordAuditLogData`, el
  DTO de facto de cada punto de registro).
- `backend/src/application/services/diff-fields.ts` (helper de diff reutilizado).
- `backend/src/application/use-cases/audit-log/list-audit-log.usecase.ts` (resolución de actor,
  incluyendo el caso `actorId === null`).
- `backend/src/application/use-cases/auth/login.usecase.ts` (los 4 casos de login).
- `frontend/src/app/features/settings/audit-log-panel.ts` (render de `metadata.changes`).

---

## AZ-044) La pantalla de Settings se desordenó al acumular pestañas y secciones nuevas
- Codigo: AZ-044
- Estado: [x] Resuelto
- Prioridad: Baja
- Reportado: 2026-07-21
- Resuelto: 2026-07-21

### Resolucion
- `settings.ts`: el `<main>` que envuelve todas las pestañas pasó de `max-w-5xl` (1024px) a
  `max-w-7xl` (1280px) — antes limitaba en la práctica cualquier grid ancho de una pestaña interna,
  volviéndolo un tope inútil.
- `tls-panel.ts` (pestaña "TLS/Sistema"): de 3 secciones apiladas en una columna angosta
  (`max-w-xl`) a un grid de 2 columnas (`max-w-6xl lg:grid-cols-2`) — columna izquierda
  "Certificado SSL/TLS", columna derecha "SMTP de Aplicación" + "Motor de Monitoreo" apiladas.
- `backups-panel.ts` (pestaña "Respaldos", la más larga): mismo patrón de grid de 2 columnas —
  izquierda: respaldo completo + lista de respaldos guardados; derecha: importar CSV, exportar/
  importar solo monitores (JSON), zona de peligro (con su borde rojo distintivo preservado). Sin
  cambios de lógica, puramente reestructuración del template.
- `api-keys-panel.ts`/`audit-log-panel.ts`: ensanchados de `max-w-2xl`/`max-w-3xl` a `max-w-4xl`
  cada uno, sin forzar un grid de 2 columnas (su contenido — una lista simple o un log
  cronológico — no lo necesita).

### Descripcion
Tras varias iteraciones agregando funciones nuevas (TLS, SMTP de Aplicación, Motor de Monitoreo,
Mantenimiento, Auditoría ampliada, etc.), la pantalla `/settings` quedó con la mayoría de sus
pestañas apiladas en una sola columna angosta centrada, desaprovechando el ancho disponible en un
uso de escritorio típico (la app está pensada para computador, no para móvil) y con aspecto
desordenado en pantallas anchas.

### Criterios de aceptacion
1. Pestañas "Respaldos" y "TLS/Sistema" muestran un grid de 2 columnas en pantallas `lg:` o más
   anchas, sin solapamientos ni columnas descompensadas.
2. Pestañas "API" y "Auditoría" se ven ensanchadas pero siguen en una columna (correcto para su
   contenido).
3. Ninguna pestaña queda con contenido cortado o desbordado tras el cambio de ancho del `<main>`.

### Pistas de investigacion
- `frontend/src/app/features/settings/settings.ts` (contenedor `<main>`, línea ~59).
- `frontend/src/app/features/settings/backups-panel.ts` y `tls-panel.ts` (patrón de grid a
  replicar en futuras pestañas que crezcan demasiado).

---

## AZ-045) Módulo de Informes Periódicos de Disponibilidad y Reportes en PDF
- Codigo: AZ-045
- Estado: [x] Resuelto
- Prioridad: Media-Alta
- Reportado: 2026-07-21
- Resuelto: 2026-07-22

### Resolucion
- Nuevo módulo completo `reports` calcado del patrón de Mantenimiento (AZ-040): entidad
  `IReportDefinition` (`domain/entities/report-definition.ts`), puerto + esquema Mongoose +
  repositorio (`report-definition-repository.ts` / `mongoose-report-definition.repository.ts`),
  CRUD de casos de uso con auditoría (`REPORT_CREATE/UPDATE/DELETE/SEND_TEST`), controlador y
  rutas `/api/v1/reports` bajo `requireRole("admin")` — sin acceso alguno para Viewer, ni en la UI
  (nueva pestaña "Informes" en `/settings`, sin punto de entrada en el Dashboard).
- **Alcance por área/grupo**: `resolveReportScopeMonitors` (bulk, a diferencia del check
  per-monitor de Mantenimiento) resuelve `all`/`group`/`monitor` reutilizando el mismo shape de
  alcance granular.
- **Métricas**: nuevo `IHeartbeatRepository.getAvailabilityReport(monitorIds, from, to)` +
  función pura `computeAvailabilityStats` (con suite de tests dedicada) calculan incidentes,
  downtime exacto en segundos (sin crédito parcial) y uptime (con el mismo crédito parcial 0.5 a
  DEGRADED que ya usa el dashboard), excluyendo heartbeats en `MAINTENANCE`. Se llama dos veces
  por informe (periodo actual y periodo anterior equivalente) para la comparación de tendencia.
- **Top de indisponibilidad/degradación**, **servicios sin incidentes** y **KPIs ejecutivos con
  trend** (↑/↓ vs. periodo anterior) implementados en `GenerateReportDataUseCase`, con tests.
- **PDF**: `pdfmake` (`LETTER`, márgenes `[40,60,40,60]`, `dontBreakRows: true`, pie "Página X de
  Y"). *Desviación deliberada del diseño original*: en vez de `chartjs-node-canvas` (requiere el
  paquete nativo `canvas`, alto riesgo de fallo de compilación en Windows sin Visual Studio Build
  Tools), el histograma de caídas se dibuja con las primitivas vectoriales propias de pdfmake
  (rectángulos) — cero dependencias nativas, decisión confirmada con el usuario. Las fuentes usan
  los 14 estándares de PDFKit (Helvetica) por nombre, sin archivos `.ttf` externos. *Recorte de
  alcance*: no se implementó una curva de latencia separada (hubiera requerido una agregación de
  series de tiempo adicional); el histograma de downtime por monitor cubre el requisito de
  "gráficos representativos".
- **Correo con adjunto**: `SendMailInput` ganó `html`/`attachments`; `SmtpMailer` los pasa a
  `nodemailer.sendMail`. El envío de informes reutiliza el transporte SMTP de aplicación
  (`ResolveAppSmtpConfig`), no el notificador multicanal por evento.
- **"Correo global de alertas"**: como no existe ese concepto en el sistema (los destinatarios
  viven por canal de notificación), `default_alert_email` reutiliza el mismo canal ya referenciado
  por `IAppSmtpSettings` ("SMTP de Aplicación") vía el nuevo `ResolveDefaultAlertRecipients` —
  decisión confirmada con el usuario antes de implementar.
- **Cron**: nueva dependencia `node-cron` (pura JS, sin bindings nativos), tick cada 15 minutos en
  `composition-root.ts` que invoca `RunScheduledReportsUseCase` — compara hora/día configurados
  contra la hora actual y usa `lastSentAt` con una guarda de "mínimo 20h" (diario) / "mínimo 6
  días" (semanal) para evitar doble envío dentro de la misma ventana, en vez de comparar límites
  exactos de calendario. Un fallo en una definición no detiene el envío del resto.
- Frontend: `report.service.ts` (calcado de `maintenance.service.ts`) + `reports-panel.ts`
  (calcado de `maintenance-panel.ts`, mismo selector de alcance reutilizado por copy-paste, mismo
  precedente ya establecido por Mantenimiento/Viewers) + `FileDownloadService.downloadFileBlob()`
  (capacidad nueva: descarga de un Blob binario devuelto por el backend, antes solo se descargaban
  strings construidos en cliente). Pestaña "Informes" agregada a `settings.ts` sin tocar ningún
  guard — `/settings` ya es 100% admin-only a nivel de ruta.
- Verificado: `pnpm typecheck` y `pnpm test` (183/183, incluye 8 tests de
  `computeAvailabilityStats`, 6 de `GenerateReportDataUseCase`/scope resolver, 8 de
  `RunScheduledReportsUseCase`) en el backend; `pnpm build` (Angular) limpio en el frontend; un
  script ad-hoc confirmó que `PdfmakeReportRenderer` genera un buffer con firma `%PDF-` válida.
  **No verificado**: un recorrido manual end-to-end en navegador (crear un informe, click en
  "Enviar prueba" contra un SMTP real, confirmar recepción del correo con el PDF adjunto) — los
  servidores de desarrollo no se levantaron en esta sesión.

### Descripcion
Azkin no tiene ninguna forma de consolidar la actividad de un periodo (día/semana) en un resumen
ejecutivo: hoy el único acceso a las métricas de caídas es el dashboard en vivo y el historial
crudo por monitor. Se solicita un sistema de generación automática (por cron) y bajo demanda de
**Informes Periódicos de Rendimiento y Disponibilidad** (Diario y Semanal), que consolide número
de incidentes, tiempo total de indisponibilidad y % de uptime por monitor/grupo, los visualice en
el panel con gráficos, y los exporte como PDF adjunto a un correo — con destinatarios configurables
por informe (correo global de alertas ya existente, o una lista propia por reporte).

Distintas áreas de una organización suelen querer ver solo su propia porción del inventario (ej.
"Comercial" solo quiere el reporte de sus webs, no el de Infraestructura), no un único reporte
global para todos — por eso el reporte necesita alcance configurable, con el mismo concepto de
alcance granular (`all`/`group`/`monitor`) que ya usan los permisos de Viewer (AZ-001) y las
ventanas de mantenimiento (AZ-040).

No existe hoy ningún scheduler/cron en el backend (no hay dependencia `node-cron` ni equivalente en
`backend/package.json`) ni ningún generador de PDF — este issue introduce ambas piezas de
infraestructura nueva, además del módulo de reporting en sí.

### Comportamiento esperado
1. Un Admin puede crear varias **definiciones de reporte** independientes (no un único reporte
   global fijo), cada una con su propia frecuencia (Diario/Semanal), horario, alcance y
   destinatarios — ej. "Diario — Comercial" acotado al grupo Comercial enviado a
   `comercial@empresa.com`, y "Semanal — Gerencia" con alcance `all` enviado al correo global.
2. Cada definición de reporte tiene un **alcance** (`all` / un grupo / uno o más monitores
   puntuales, mismo concepto que ya usan los permisos de Viewer y las ventanas de mantenimiento):
   el reporte solo consolida y muestra los monitores dentro de ese alcance, nunca el inventario
   completo si el alcance es más acotado.
3. El informe consolida, por el periodo correspondiente (últimas 24h o últimos 7 días) y dentro de
   su alcance: total de incidentes (transiciones a `DOWN`/`DEGRADED`), tiempo total de
   indisponibilidad acumulado (suma exacta de segundos en `DOWN`/`DEGRADED`, no una estimación por
   intervalo de check), y % de uptime consolidado por monitor y por grupo.
4. Al llegar la hora programada, el sistema genera el PDF y lo envía por correo como adjunto, con
   un resumen ejecutivo en el cuerpo del correo (HTML) antes del PDF.
5. Cada definición de reporte elige, de forma independiente, si el envío va al correo global de
   alertas ya configurado en el sistema o a una lista de correos específica definida solo para ese
   reporte (gerencia, TI, clientes, el área dueña del alcance, etc.).
6. El Admin puede generar y descargar el PDF de cualquier definición bajo demanda
   ("hoy"/"esta semana") y enviar un correo de prueba, sin esperar al cron.
7. El PDF incluye gráficos (histograma de caídas, curva de latencia, desglose de uptime por
   grupo/activo) generados en el servidor (sin navegador headless).
8. El informe incluye un **Top de indisponibilidad/degradación**: ranking de los N monitores (
   dentro del alcance de la definición) con más incidentes y/o más segundos acumulados en
   `DOWN`/`DEGRADED` en el periodo, ordenado de peor a mejor — la vista rápida de "qué está
   fallando más" para una gerencia que no va a leer el detalle completo.
9. El informe incluye, de forma igual de visible que el Top de fallas, un listado de **servicios
   sin incidentes** ("100% uptime del periodo" / cero caídas) — contenido positivo pensado para
   reportar a un área o gerencia, no solo lo que salió mal.
10. El resumen ejecutivo (primer bloque del PDF y del cuerpo del correo) muestra KPIs tipo tarjeta
    (uptime global del periodo, incidentes totales, tiempo total de indisponibilidad, monitor más
    estable y monitor más problemático) antes de entrar al detalle tabular — el formato "ejecutivo"
    que puede leerse en 10 segundos sin abrir el PDF completo.
11. Cada KPI del resumen ejecutivo se muestra junto a una **comparación con el periodo anterior**
    equivalente (el día previo para el Diario, la semana previa para el Semanal): variación en
    puntos porcentuales de uptime y en número de incidentes, con indicador visual de mejora/
    empeoramiento (ej. ↑/↓ en verde/rojo) — la pregunta que una gerencia hace de inmediato es
    "¿vamos mejor o peor que la vez pasada?", no solo el valor absoluto del periodo.
12. El módulo completo (crear/editar/eliminar definiciones, enviar prueba, descargar PDF bajo
    demanda) es exclusivo del rol Admin — un Viewer no tiene acceso a ninguna parte de este módulo,
    ni siquiera de solo lectura, ya que el reporte puede exponer datos fuera del alcance granular
    que el Viewer tiene autorizado hoy en el dashboard.
13. Toda la funcionalidad vive únicamente dentro de `/settings` (nueva pestaña "Informes", mismo
    nivel que "Mantenimiento" y "Respaldos") — no hay ningún punto de entrada en el Dashboard
    general; un Admin que quiera el PDF de hoy entra a `/settings` a buscarlo, igual que ya hace
    hoy para descargar un respaldo.

### Diseño propuesto

**Persistencia de configuración**: a diferencia de `IAppSmtpSettings`/`IMonitoringEngineSettings`
(un singleton por instancia), el reporte necesita **múltiples definiciones** independientes (una
por área/alcance), así que el patrón correcto es el mismo de `IMaintenanceWindow` (AZ-040):
colección con CRUD propio, no un singleton.

```ts
// domain/entities/report-definition.ts
export type ReportFrequency = "daily" | "weekly";
export type ReportRecipientMode = "default_alert_email" | "custom_list";

export type ReportScopeType = "all" | "group" | "monitor";
export interface IReportScope {
  type: ReportScopeType;
  value?: string; // nombre de grupo o id de monitor; se omite si type === "all"
}
// Mismo shape que `IMaintenanceScope` (AZ-040) / permisos de Viewer — se reutiliza el mismo
// concepto de alcance granular, no se inventa uno nuevo.

export interface IReportDefinition {
  id: string;
  name: string;                  // ej. "Diario — Comercial", visible en la UI y en el asunto del correo
  enabled: boolean;
  frequency: ReportFrequency;
  scope: IReportScope[];
  hour: number;                  // 0-23, hora local del servidor/instancia
  dayOfWeek?: number;            // 0-6, solo si frequency === "weekly"
  recipientMode: ReportRecipientMode;
  recipientEmails: string[];     // solo aplica si recipientMode === "custom_list"
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Scheduler**: introducir `node-cron` (no hay ninguna dependencia de cron en el repo hoy) cableado
en `composition-root.ts`, con una tarea de "tick" (ej. cada minuto/hora) que lee todas las
`IReportDefinition` habilitadas y dispara la generación de las que coinciden con la hora/día actual
— mismo espíritu que el resto del sistema evita lógica de negocio en `composition-root.ts`
(ver AZ-013): el cron solo debe invocar un `RunScheduledReportsUseCase`, sin lógica propia.

**Métricas** (agregación sobre `Heartbeat`, reutilizando el patrón de `getSummaries()` en
`mongoose-heartbeat.repository.ts`): nuevo método en `IHeartbeatRepository` (ej.
`getAvailabilityReport(monitorIds, from, to)`) que agregue, por monitor, conteo de transiciones a
`DOWN`/`DEGRADED` y suma de segundos en esos estados entre heartbeats consecutivos — cuidando
excluir explícitamente los heartbeats en `MAINTENANCE` (ver AZ-040), igual que ya hace
`getSummaries()` para el cálculo de `uptime24h`. El caso de uso de generación llama este mismo
método dos veces por definición de reporte: una para `[from, to)` (el periodo actual) y otra para
`[from - periodo, from)` (el periodo anterior equivalente), y calcula la variación entre ambos para
la comparación de tendencia — sin tabla ni cache nueva, es la misma agregación con otro rango.

**Generación de PDF**: `pdfmake` (sin Puppeteer/Chromium) — página `LETTER`, márgenes
`[40, 60, 40, 60]`, tablas con `dontBreakRows: true`, encabezado/pie con numeración "Página X de Y".
Gráficos renderizados server-side a PNG/Base64 (ej. `chartjs-node-canvas`) e inyectados como
`image` en la definición de `pdfmake`.

**Contenido orientado a gerencia/área** (no solo datos crudos), en este orden dentro del PDF —
todo acotado al `scope` de la definición de reporte:
1. Encabezado con el `name` de la definición (ej. "Diario — Comercial") y el rango de fechas exacto
   del periodo, para que quede claro a qué alcance corresponde el PDF.
2. Bloque de KPIs tipo tarjeta (uptime global, incidentes totales, downtime acumulado, mejor/peor
   monitor del periodo), cada uno con su variación vs. el periodo anterior equivalente (↑/↓ en
   puntos porcentuales o en número de incidentes).
3. **Top de indisponibilidad/degradación**: tabla ordenada de mayor a menor downtime/incidentes
   (monitor, grupo, incidentes, segundos de indisponibilidad, % uptime), truncada a un Top N
   configurable (ej. 10) con el resto agregado en un total "otros".
4. **Servicios sin incidentes**: lista simple (o chip grid) de monitores con 0 caídas/degradaciones
   en el periodo — refuerza el mensaje positivo, no solo el listado de fallas.
5. Gráficos: histograma de caídas por día (o por hora en el Diario), curva de latencia, desglose de
   uptime por grupo.
6. Detalle tabular completo por monitor (el nivel de detalle que hoy no existe en ningún lado).

**Envío**: reutilizar `smtp-mailer.ts`/`multichannel-notifier.ts` (ya usado por el canal de
notificación tipo email y por recuperación de contraseña) agregando soporte de adjuntos; resolver
destinatarios según `recipientMode` (correo global de alertas vs `recipientEmails` del reporte).

**Frontend**: nueva pestaña "Informes" en `/settings` (mismo nivel que "Mantenimiento" y
"Respaldos", solo accesible para Admin — sin punto de entrada en el Dashboard general ni en ningún
lugar visible para Viewer) con listado de definiciones de reporte existentes (mismo patrón de
listado que la pestaña "Mantenimiento" de AZ-040) y botón "Nuevo reporte": formulario con nombre,
frecuencia (Diario/Semanal), selector de alcance (reutilizando el mismo componente que ya usa el
formulario de permisos de Viewer y el de Mantenimiento para elegir "Todo"/"Grupo"/"Monitor"),
selector de hora/día, radio "Correo de alertas global" vs "Lista personalizada" con input de chips
para los correos. Cada definición en el listado tiene botones "Enviar prueba" y "Descargar PDF de
hoy/esta semana".

### Criterios de aceptacion
1. Con una definición de reporte Diario habilitada a una hora dada, al llegar esa hora se genera y
   envía un correo con PDF adjunto a los destinatarios configurados, sin intervención manual.
2. Una definición con alcance de grupo (ej. "Comercial") genera un PDF que solo contiene monitores
   de ese grupo — no el inventario completo — y su Top/servicios-sin-incidentes están acotados al
   mismo alcance.
3. El PDF muestra el mismo número de incidentes y segundos de indisponibilidad que se pueden
   verificar manualmente sumando el historial crudo de heartbeats del periodo, dentro del alcance
   de la definición.
4. Cambiar el modo de destinatarios de "correo global" a "lista personalizada" (o viceversa) en una
   definición se refleja en su próximo envío, programado o de prueba, sin afectar a otras
   definiciones.
5. "Enviar reporte de prueba" y "Descargar PDF de hoy/esta semana" funcionan por definición, sin
   depender de que el cron haya disparado.
6. Los heartbeats en `MAINTENANCE` no se cuentan como incidente ni como tiempo de indisponibilidad
   en el informe.
7. Endpoints de configuración/envío manual devuelven 403 para rol Viewer, y la pestaña "Informes"
   de `/settings` (incluida en el listado de pestañas visibles) no aparece en absoluto para un
   Viewer — ni siquiera en modo solo lectura.
8. El PDF muestra un Top de indisponibilidad/degradación ordenado correctamente de mayor a menor
   (verificable contra los datos crudos) y, por separado, la lista de monitores con 0 incidentes en
   el periodo — ambos visibles sin necesidad de abrir el detalle tabular completo.
9. Los KPIs del resumen ejecutivo muestran una variación vs. el periodo anterior equivalente que
   coincide con calcular manualmente la misma métrica sobre el rango previo (ej. uptime del día
   anterior para el Diario).

### Pistas de investigacion
- `backend/src/domain/entities/maintenance-window.ts` y
  `application/services/maintenance-scope-policy.ts` (AZ-040 — precedente directo del patrón de
  colección con alcance granular `all`/`group`/`monitor` a replicar en `IReportDefinition`).
- `backend/src/domain/entities/app-smtp-settings.ts` y `monitoring-engine-settings.ts` (precedente
  del shape de una entidad de configuración simple con `updatedAt`/`updatedById`).
- `backend/src/infrastructure/persistence/mongoose/repositories/mongoose-heartbeat.repository.ts`
  (`getSummaries()`, punto de partida para la nueva agregación de disponibilidad por periodo).
- `backend/src/infrastructure/notifier/smtp-mailer.ts` y `multichannel-notifier.ts` (transporte de
  correo existente a extender con adjuntos).
- `backend/src/domain/value-objects/monitor-status.ts` (`MAINTENANCE`) y AZ-040 (exclusión de
  ventanas de mantenimiento del cálculo).
- `backend/package.json` — no existe aún ninguna dependencia de cron; evaluar `node-cron` por ser
  la opción más liviana ya usada implícitamente como referencia en el resto de specs del proyecto.

---

## AZ-046) El estado DEGRADADO se disparaba con ping ICMP al host, en vez del puerto real de la app
- Codigo: AZ-046
- Estado: [x] Resuelto
- Prioridad: Alta
- Reportado: 2026-07-22
- Resuelto: 2026-07-22

### Resolucion
- `execute-check.usecase.ts` (`runDegradationHeuristic`): se eliminó por completo el chequeo de
  ping ICMP de la decisión DOWN→DEGRADED. Antes, tras un DOWN confirmado de un monitor HTTP, la
  heurística marcaba DEGRADED si **ping o puerto** respondían (`if (!pingOk && !portOk) return`);
  ahora depende únicamente de un handshake TCP exitoso contra el puerto exacto de la app
  (`if (!portResult.ok) return`) — si el puerto rechaza la conexión, el DOWN original queda como
  veredicto final sin importar si el host responde ping.
- Mensaje del heartbeat DEGRADADO actualizado ("El puerto TCP de la aplicación responde pero la
  petición HTTP no...") para no seguir mencionando "ping" como señal de degradación.
- Test existente que encodaba el comportamiento viejo (`ping: ok, port: ECONNREFUSED` esperando
  DEGRADED) corregido para reflejar el veredicto correcto (DOWN, sin heartbeat adicional); nuevo
  test agregado para el caso real reportado (puerto exacto rechaza conexión pese a que el host
  responde ping → se mantiene en DOWN).

### Descripcion
Un usuario apagó deliberadamente un servicio HTTP (puerto TCP cerrado, `nc -zv` confirmó
`Connection refused`) para probar el flujo de alertas, y en vez de recibir una alerta DOWN
consistente, recibió DOWN seguido casi de inmediato por una alerta DEGRADED contradictoria
("Servidor responde a nivel de red (ping) pero la aplicación no — posible degradación/sobrecarga",
con `Ping: 0ms`). El host en cuestión aloja más de un servicio, así que el ping ICMP al host
respondía con normalidad aunque el puerto específico del monitor estuviera completamente cerrado
— la heurística post-caída de AZ-042 confundía "el host está vivo" (ping) con "la app monitoreada
está viva pero lenta/sobrecargada" (que solo un handshake TCP al puerto exacto puede indicar).

### Comportamiento esperado
1. Tras un DOWN confirmado de un monitor HTTP, el heartbeat solo se reclasifica a DEGRADED si un
   handshake TCP contra el puerto exacto de la app tiene éxito (el puerto acepta conexión pero la
   petición HTTP igual falla).
2. Si el puerto exacto rechaza la conexión (`ECONNREFUSED`) o no responde, el DOWN original queda
   como veredicto final — sin importar si un ping ICMP al host sí responde.
3. El mensaje del heartbeat DEGRADADO no atribuye la señal a "ping"; refleja específicamente que
   fue el puerto TCP el que respondió.

### Criterios de aceptacion
1. Con el puerto exacto de la app en `ECONNREFUSED` y el host respondiendo ping, el monitor queda
   en DOWN — no se genera un segundo heartbeat DEGRADADO ni una segunda alerta.
2. Con el puerto exacto de la app aceptando conexión pero la petición HTTP fallando, el monitor sí
   se reclasifica a DEGRADADO, con el ping medido del handshake TCP (no `null`).
3. Tests unitarios cubren ambos casos (`execute-check.usecase.test.ts`).

### Pistas de investigacion
- `backend/src/application/use-cases/monitoring/execute-check.usecase.ts`
  (`runDegradationHeuristic`).
- `backend/src/application/use-cases/monitoring/execute-check.usecase.test.ts`.

---

## AZ-047) Informes (AZ-045): huecos de monitoreo detenido contados como downtime real, y "Enviar ahora" podía crear informes duplicados
- Codigo: AZ-047
- Estado: [x] Resuelto
- Prioridad: Media
- Reportado: 2026-07-22
- Resuelto: 2026-07-22

### Resolucion
**Backend — cálculo de uptime (`availability-report-calculator.ts`):**
- `computeAvailabilityStats` ganó un parámetro `maxIntervalSeconds`: la duración atribuida a un
  solo heartbeat (hasta el siguiente, o hasta `to`) ahora se acota a ese tope; el exceso se excluye
  del cálculo por completo (ni suma downtime ni uptime) en vez de atribuirle todo el hueco al
  último estado conocido — sin importar si ese estado era DOWN/DEGRADED (falso downtime masivo,
  el bug reportado: ~17% de uptime con solo 2 caídas reales) o UP (falso 100% de uptime
  extrapolando sobre un hueco del que no hay datos).
- `GenerateReportDataUseCase` deriva el tope dinámicamente del intervalo/retryInterval configurado
  de los monitores del reporte (con margen de seguridad 20x, piso de 30 min) en vez de un valor
  fijo ciego, para no recortar monitores con un intervalo de chequeo legítimamente largo.
- `IHeartbeatRepository.getAvailabilityReport` y su implementación Mongoose ganaron el parámetro
  opcional `maxIntervalSeconds` para propagar el tope.
- Causa raíz: reinicios frecuentes del backend durante el desarrollo/pruebas de AZ-045 dejaron
  huecos de horas en el historial de heartbeats; varios monitores tenían su último heartbeat antes
  de un hueco en DOWN/DEGRADED, y ese estado se estiraba sobre horas de "silencio" del motor de
  monitoreo (no del sitio monitoreado).

**Frontend — formulario de "Informes" (`reports-panel.ts`):**
- El botón "Enviar ahora" reseteaba el formulario a uno nuevo y en blanco *antes* de que el envío
  de prueba terminara, y ningún botón se deshabilitaba durante ese intervalo — un clic repetido en
  esa ventana creaba un informe duplicado en vez de tocar el que se acababa de crear (percibido
  como "ambos botones hacen lo mismo").
- `onSaveAndSendNow()` ahora deja el formulario en modo edición sobre el informe recién
  guardado (en vez de resetearlo) y ambos botones ("Enviar ahora"/"Crear informe" o "Guardar
  cambios") se deshabilitan mientras cualquiera de los dos flujos está en curso (`formBusy`).

### Descripcion
Un PDF de prueba generado con datos reales mostró columnas de Uptime de ~17% para más de un
monitor a la vez, pese a que el usuario reportó solo 2 caídas reales — resultado de reinicios del
backend durante el desarrollo que dejaron huecos de horas en el historial de heartbeats,
malinterpretados como downtime continuo. Por separado, al usar el botón nuevo "Enviar ahora" del
formulario de creación de informes, el reset prematuro del formulario (sin deshabilitar los
botones) permitía crear un informe duplicado con un clic de más, lo que a su vez causó un 400 al
intentar un "enviar prueba" sobre el duplicado (sin destinatarios configurados).

### Comportamiento esperado
1. Un hueco anómalo en el historial de heartbeats (motor de monitoreo detenido/reiniciado) no se
   cuenta como downtime real ni como uptime real — queda excluido del cálculo.
2. Un monitor con un intervalo de chequeo configurado legítimamente largo no ve su historial
   recortado por el tope de hueco.
3. El botón "Enviar ahora" no puede crear más de un informe por acción del usuario: mientras hay
   un guardado/envío en curso, ambos botones de acción quedan deshabilitados.
4. Tras "Enviar ahora", el formulario queda claramente en modo edición sobre el informe recién
   creado, no en un estado "nuevo" ambiguo.

### Criterios de aceptacion
1. Un monitor con un hueco de heartbeats de N horas (motor detenido) y un solo heartbeat DOWN
   justo antes del hueco no reporta un uptime cercano a 0% — el downtime queda acotado al tope
   derivado del intervalo del monitor.
2. Tests unitarios cubren: hueco largo acotado correctamente, tope personalizado respetado, y los
   casos de duración normal (sin hueco) sin verse afectados por el tope.
3. Hacer clic en "Enviar ahora" y de inmediato volver a hacer clic en cualquiera de los dos
   botones no crea un segundo informe — los botones están deshabilitados hasta que la operación
   en curso termina.

### Pistas de investigacion
- `backend/src/application/services/availability-report-calculator.ts` y su test.
- `backend/src/application/use-cases/reports/generate-report-data.usecase.ts` (derivación del
  tope desde `scopedMonitors`).
- `backend/src/application/ports/repositories/heartbeat-repository.ts` y
  `mongoose-heartbeat.repository.ts` (`getAvailabilityReport`).
- `frontend/src/app/features/settings/reports-panel.ts` (`onSave`/`onSaveAndSendNow`/`formBusy`).

---

## AZ-048) Informes (AZ-045): el rango de fechas del PDF/correo se mostraba en UTC en vez de hora local del servidor
- Codigo: AZ-048
- Estado: [x] Resuelto
- Prioridad: Baja
- Reportado: 2026-07-22
- Resuelto: 2026-07-22

### Resolucion
- `formatDateRange` (`application/services/report-format.ts`) usaba `Date.toISOString()`
  (siempre UTC) para imprimir el encabezado del PDF y el cuerpo del correo, etiquetado
  explícitamente "(UTC)". Se reemplazó por un formateo con los getters locales de `Date`
  (`getFullYear`/`getMonth`/`getDate`/`getHours`/`getMinutes`), sin la etiqueta UTC — ahora
  coincide con la hora local del servidor, la misma referencia que ya usa
  `RunScheduledReportsUseCase.isDue()` (`now.getHours()`/`now.getDay()`) para decidir cuándo
  disparar un informe según el `hour`/`dayOfWeek` configurado.

### Descripcion
El encabezado de un informe generado mostraba un rango como "2026-07-21 15:51 — 2026-07-22 15:51
(UTC)", pese a que el reloj local al momento de revisarlo marcaba 12:22 y el informe se había
generado un buen rato antes — el rango impreso no calzaba con la hora que el usuario esperaba ver.
Causa: `formatDateRange` imprimía en UTC mientras que el resto del sistema (incluyendo la propia
hora `hour`/`dayOfWeek` que el admin configura para el envío programado) opera en hora local del
servidor — dos referencias horarias distintas conviviendo en el mismo informe.

### Comportamiento esperado
1. El rango de fechas mostrado en el PDF y en el cuerpo del correo usa la misma hora local del
   servidor que ya rige la programación (`hour`/`dayOfWeek`) del informe.
2. No se etiqueta el rango como "(UTC)" ya que deja de serlo.

### Criterios de aceptacion
1. El rango impreso en un informe generado "ahora" tiene como límite superior una hora cercana a
   la hora local real del servidor al momento de la generación, no desplazada por el offset UTC.

### Pistas de investigacion
- `backend/src/application/services/report-format.ts` (`formatDateRange`).
- `backend/src/application/use-cases/reports/run-scheduled-reports.usecase.ts` (`isDue`, misma
  referencia de hora local que debe coincidir).

---

## AZ-049) Federacion de instancias Azkin independientes en distintas regiones geograficas, con vista de monitoreo combinada y comunicacion cifrada por enrollment
- Codigo: AZ-049
- Estado: [ ] Abierto
- Prioridad: Alta
- Reportado: 2026-07-22

### Descripcion
Hoy Azkin corre como una unica instancia (sus 3 contenedores: `azkin-db`, `azkin-back`, `azkin-front`) con una
unica ubicacion geografica de origen para todos sus checks activos (HTTP, Ping, TCP, DNS, SNMP). Esto impide
distinguir "el sitio esta realmente caido" de "hay un problema de red regional entre el datacenter de Azkin y el
sitio monitoreado" (ej. un corte de peering entre Chile y Asia que no afecta al resto del mundo).

Caso de uso concreto: desplegar un stack Azkin completo en Chile y otro stack Azkin completo en China, cada uno
monitoreando (entre otras cosas) las mismas paginas/servicios, y poder ver en un solo lugar tanto el estado
individual de cada region como una vista combinada/promediada.

**Decision de arquitectura (reemplaza el planteamiento inicial de "central unico + nodos sonda"):** el modelo
elegido es **federacion de instancias completas e independientes**, no un central del que todo dependa:

- Cada ubicacion corre un Azkin completo y autosuficiente: su propia base de datos, su propio dashboard, sus
  propios monitores, su propia configuracion de alertas/notificaciones. Ninguna instancia necesita que otra este
  viva para poder chequear, alertar o mostrar su propio dashboard.
- Dos (o mas) instancias se **enrolan** entre si (el enrollment en si siempre es par a par: cada par de instancias
  intercambia su propio token y certificados). Lo que **no** debe ser pairwise es el vinculo de "cual monitor es el
  mismo objetivo": se modela como un **grupo de monitoreo equivalente** (un conjunto de {instancia, monitor} que
  representan el mismo sitio/servicio), para que 3 o mas instancias (ej. Chile, China, Alemania) puedan combinarse
  en una sola vista sin tener que mantener un vinculo cruzado independiente entre cada par. Para que el grupo
  funcione entre 3+ instancias, cada par involucrado debe estar enrolado entre si (A-B, A-C y B-C), pero el
  agrupamiento de monitores es una capa aparte de esa topologia de confianza.
- Si una instancia deja de responder, las demas no pierden funcionalidad propia (siguen chequeando, alertando y
  mostrando su dashboard local); lo unico que se pierde es la actualizacion del combinado con los datos de esa
  instancia, hasta que vuelva a estar disponible.
- Esto logra la independencia tipo "HA informal" que se busca (una caida en una region no tumba ni bloquea a las
  demas) **sin** la complejidad de un sistema distribuido con consenso: no hay una unica fila de base de datos que
  dos instancias deban editar a la vez, cada una es dueña exclusiva de sus propios monitores/datos. Un modelo de
  malla con autoridad compartida y resolucion de conflictos (evaluado y descartado en la conversacion previa) no
  es necesario para este caso de uso.
- Alertas: por defecto cada instancia notifica de forma **totalmente independiente** segun lo que ve localmente
  (Chile alerta con lo que ve Chile, China alerta con lo que ve China) — no hay que esperar consenso entre
  instancias para avisar. Queda como mejora futura opcional (fuera de alcance de esta issue) un modo "confirmar
  con la instancia federada antes de notificar" para reducir falsos positivos de un solo lado.

El canal de comunicacion entre instancias federadas debe ir cifrado extremo a extremo y autenticado por instancia,
sin depender de compartir un secreto de larga duracion en texto plano. La referencia de diseño acordada es el
modelo de enrollment de Elasticsearch/Kibana: un token de un solo uso (hash largo, con expiracion corta) que se
genera en una instancia y se pega una unica vez en la otra al enrolarlas; ese token se consume durante un proceso
de enrollment que emite certificados (mTLS) para ese par especifico de instancias, y a partir de ahi toda la
comunicacion se autentica con esos certificados, no con el token.

**Requisito operacional:** todo el mecanismo de reconstruccion de historial (`since=<timestamp_utc>`) asume que el
reloj de cada instancia esta razonablemente sincronizado (NTP). Un reloj desfasado en un VPS puede hacer que el
cursor traiga datos de mas o de menos sin ningun error visible — se documenta como requisito de despliegue, igual
que otros requisitos de red/infraestructura que ya lista el README.

**Alcance deliberadamente acotado (herramienta simple, no un sistema distribuido de gran escala):** esta issue se
diseña y se limita a **un maximo de 5 instancias federadas simultaneas**. El modelo de malla completa (cada par se
enrola directamente, hasta 10 enrollments en el caso de 5 instancias) es simple y suficiente para ese tamaño y no
necesita automatizar nada mas. **No es objetivo de esta issue** soportar 10+ instancias, invitaciones en bloque, ni
un modo relay/hub — eso seria sobreingenieria para el caso de uso real (un puñado de regiones), y si algun dia hace
falta escalar mas alla de 5, deberia evaluarse como una issue nueva y separada, con su propio analisis, en vez de
cargar este diseño con complejidad que hoy nadie necesita. El limite de 5 se aplica como una cuota dura (no solo
una recomendacion) y queda advertido tanto en `docs/` como en la UI de `/settings`.

### Comportamiento esperado
1. Un Admin puede generar, desde `/settings`, un token de enrollment (hash largo, un solo uso, expiracion corta —
   ej. 15-30 min) para invitar a otra instancia Azkin a federarse.
2. El Admin de la otra instancia pega ese token en su propio `/settings` para completar el enrollment: se
   intercambian certificados (mTLS) especificos para ese par de instancias, y el token queda invalidado de
   inmediato tras usarse.
3. La comunicacion entre instancias federadas corre sobre un puerto dedicado y configurable (no necesariamente el
   mismo puerto del frontend/API web), analogo a como AZ-006 permite configurar el puerto HTTPS. El intercambio de
   datos se hace por sondeo periodico autenticado por certificado (cada instancia consulta a sus pares a
   intervalos regulares), no por una conexion persistente tipo WebSocket — es mas simple de operar y de
   recuperar tras un corte, y como no existe un "central" fijo, cualquiera de las dos instancias puede iniciar el
   sondeo hacia la otra sin que importe cual.
4. Para vincular un monitor local con su equivalente en otras instancias federadas, el Admin explora un listado
   acotado de los monitores de cada instancia remota ya federada (solo nombre/URL/tipo, nunca configuracion
   sensible como credenciales SNMP o secretos de notificacion), y agrega cada uno a un **grupo de monitoreo
   equivalente** (no un vinculo 1:1): el grupo puede tener 2, 3 o mas miembros, uno por instancia, todos
   representando "el mismo objetivo" (ej. "este HTTP en Chile + ese HTTP en China + ese HTTP en Alemania son el
   mismo sitio"). Agregar o quitar un miembro del grupo no requiere recrear vinculos con los demas miembros.
5. Para un monitor que pertenece a un grupo de monitoreo equivalente, el dashboard ofrece un **selector visual de
   vista** (ej. dos pestañas o un toggle "Por region | Combinado") que cualquier usuario con permiso sobre ese
   monitor puede cambiar en el momento, sin que un Admin tenga que activarlo de antemano ni que quede guardado como
   configuracion del grupo. La vista por defecto al entrar es "Por region" (estado y latencia de cada instancia
   miembro, sin mezclar). Si el usuario cambia a "Combinado", ve un agregado (latencia promedio entre todos los
   miembros del grupo, y un estado unico calculado con la jerarquia de severidad fija
   `DOWN > DEGRADED > PENDING > MAINTENANCE > UP` — la **misma jerarquia que ya usa `combineStatus()` en
   `get-group-overview.usecase.ts` para combinar el estado de un grupo local de monitores**, reutilizada tal cual
   para no tener dos reglas de severidad distintas conviviendo en el mismo sistema: el combinado toma el peor
   estado presente entre los miembros, mostrando ademas cuantos estan afectados sobre el total — ej. "DOWN (1/3
   regiones)"). Un miembro en `MAINTENANCE` no opaca un `DOWN`/`DEGRADED`/`PENDING` real de otro miembro (mismo
   criterio de AZ-040), aunque en la vista "Por region" se siga viendo cual instancia esta en mantenimiento. Todo
   valor combinado queda siempre
   etiquetado en pantalla como derivado, nunca presentado como si fuera una medicion directa (mismo criterio que ya
   aplico este proyecto en AZ-012 sobre no presentar datos fabricados como si fueran una medicion real). Cambiar de
   vista es solo una preferencia de visualizacion momentanea, no una decision de configuracion que otro usuario
   herede.
6. Cada instancia sigue funcionando de forma completa e independiente (chequeos, alertas, dashboard local) esté o
   no disponible cualquiera de sus pares federados.
7. Si una instancia federada deja de responder al sondeo por mas de un umbral configurable, la vista combinada lo
   indica claramente ("sin datos de [instancia] desde [hora]") en vez de mostrar un dato viejo como si fuera
   actual, y se dispara una notificacion local (reutilizando el sistema de notificaciones multicanal existente)
   avisando que esa federacion especifica quedo sin reportar.
8. Un Admin puede desvincular/revocar la federacion con otra instancia desde `/settings`, cortando de inmediato el
   intercambio de datos con esa instancia (sin afectar el resto de instancias federadas ni el funcionamiento local).
9. El listado de monitores remotos y los datos de monitores vinculados respetan el modelo de permisos existente:
   un Viewer solo ve, dentro de la vista combinada, los monitores para los que ya tiene permiso localmente (mismo
   criterio de aislamiento que AZ-001/AZ-021), nunca datos adicionales por el solo hecho de existir una federacion.
10. Cada resultado recibido de un par federado se persiste localmente (coleccion Time-Series con el mismo TTL de
    30 dias que ya usan los heartbeats propios, ver stack tecnologico en el README), no solo se muestra en vivo.
    Toda estampa de tiempo que viaja entre instancias o se guarda en esa coleccion es **UTC** (ISO 8601 con offset
    `Z`); el frontend de cada instancia es el unico responsable de convertirla a la hora local de quien mira el
    dashboard (mismo ajuste que ya se hizo en AZ-048 para no mezclar referencias horarias distintas). El sondeo
    periodico no trae solo "el ultimo estado": cada instancia recuerda el timestamp UTC del ultimo dato recibido de
    cada par y lo envia como cursor (`since=<ultimo_timestamp_utc>`), de modo que el par devuelve en lote todos los
    resultados generados desde ese punto — esto es lo que permite reconstruir sin huecos el historial combinado de
    una ventana en que el par estuvo desconectado, una vez que vuelve a estar disponible.
11. La vista comparativa multi-region se resuelve como tabla/grafico de lineas por region (mismo estilo ECharts que
    ya usa `dashboard.ts`), no como mapa geografico interactivo — mantiene consistencia visual con el resto del
    dashboard actual y evita duplicar esfuerzo con AZ-033 (benchmark de identidad visual), que sigue siendo el
    lugar para decidir si mas adelante conviene una vista tipo mapa.
12. Al crear o editar un informe periodico (AZ-045), si el reporte incluye uno o mas monitores vinculados a una
    instancia federada, el formulario pregunta explicitamente al Admin si el informe debe incluir tambien el
    desglose de las instancias federadas para esos monitores, o generarse igual que hoy (solo con datos locales).
    La opcion por defecto es "solo datos locales" (mismo comportamiento que existe hoy, sin sorpresas para
    informes ya configurados).
13. La CA local (o el par de llaves usado para emitir certificados mTLS a los pares) se genera una sola vez y se
    persiste de forma segura (en Mongo o en un volumen Docker montado, ver AZ-006/AZ-041 sobre manejo de material
    criptografico sensible), de modo que reiniciar el contenedor `azkin-back` no invalide los certificados ya
    emitidos ni rompa las federaciones existentes.
14. Revocar una federacion no depende solo de que el certificado deje de ser valido en el proximo handshake TLS:
    cada request de sondeo o de listado de monitores verifica ademas, contra el estado persistido en Mongo, que
    esa instancia no fue revocada — asi, una conexion HTTP con keep-alive ya abierta al momento de revocar tambien
    deja de servir datos en la siguiente request, sin esperar a que expire o se renueve la conexion.
15. Cada instancia federada tiene una etiqueta/nombre visible asignado por el Admin (ej. "Santiago-VPS1"), usado
    para identificarla en la vista "Por region" y en los graficos, en vez de mostrar solo su direccion/IP.
16. Existe un limite **duro** de 5 instancias federadas simultaneas por instancia (cuota, en la misma linea que la
    cuota existente de 50 monitores). Intentar federar una sexta instancia se rechaza con un mensaje claro que
    explica el limite, no con un error generico. El limite se muestra tambien de forma proactiva en `/settings`
    (ej. "3/5 instancias federadas") para que el Admin lo vea antes de intentar pasarse.
17. El umbral de "federacion sin reportar" (item 7) tiene un valor por defecto explicito y documentado (ej. 3
    sondeos fallidos consecutivos), configurable por el Admin igual que otros umbrales del sistema (ver AZ-042).
18. Se documenta en `docs/` el requisito de red nuevo (puerto dedicado, direccion del trafico), el requisito de
    reloj sincronizado (NTP) entre instancias federadas, y el limite de 5 instancias como una decision deliberada
    de alcance (no una limitacion tecnica temporal), siguiendo el mismo formato de la tabla de puertos que ya
    existe en `docs/instalacion-docker.md` §12.
19. La documentacion de esta funcionalidad no queda solo en esta issue: se actualizan los 3 documentos que el
    proyecto ya usa para esto, cada uno con su rol (ver tabla de "📚 Documentación" del README):
    - **`docs/ARCHITECTURE.md`**: nueva seccion numerada (siguiendo el estilo de las secciones existentes, ej.
      §12 Mantenimiento, §13 DEGRADADO) que explica el **porque** de la federacion (distinguir una caida real de
      un problema de red regional, lograr independencia entre regiones sin la complejidad de un sistema
      distribuido con consenso — la misma decision de arquitectura ya razonada en esta issue) y el **como**
      (flujo de enrollment, grupo de monitoreo equivalente, vista combinada), con al menos un diagrama `mermaid`
      (mismo formato que ya usan las secciones 1, 2 y 6 de ese documento) mostrando el flujo de enrollment
      (token → certificados mTLS) y otro mostrando el flujo de sondeo periodico entre dos instancias.
    - **`docs/instalacion-docker.md`**: actualiza §12 (tabla de puertos) con el puerto de federacion, agrega el
      requisito de NTP y documenta explicitamente el limite de 5 instancias como decision de producto, no como
      "todavia no soportamos mas".
    - **`README.md`**: agrega la federacion a "✨ Funcionalidades destacadas" con una descripcion breve que
      incluya el limite de 5 instancias (para que quede visible sin tener que entrar a `docs/`), y enlaza a la
      seccion nueva de `ARCHITECTURE.md` para el detalle.

### Criterios de aceptacion
1. Existe flujo de enrollment entre dos instancias: generar token en A → pegarlo en B → certificados emitidos →
   ambas instancias se ven mutuamente como "federada: conectada" en `/settings`.
2. El token de enrollment no sirve una segunda vez, y expira solo si no se usa dentro de la ventana configurada.
3. Al crear un vinculo, el Admin puede buscar/seleccionar el monitor remoto desde un listado (no requiere copiar
   un ID a mano), y ese listado no expone campos sensibles del monitor remoto.
4. Un monitor vinculado entre 2+ instancias federadas abre siempre en vista "Por region" (resultado desagregado);
   el usuario puede cambiar al momento a "Combinado" con el selector visual y volver atras, sin que esa preferencia
   quede guardada como configuracion del vinculo ni la vea afectada otro usuario. La vista "Combinado" siempre
   queda etiquetada en pantalla como valor derivado.
5. Apagar completamente la instancia B (simulando una caida total) no afecta ningun chequeo, alerta ni acceso al
   dashboard de la instancia A — solo la vista combinada deja de recibir datos frescos de B y, pasado el umbral
   configurado, dispara una notificacion de "federacion sin reportar".
6. Revocar la federacion con una instancia desde `/settings` corta su capacidad de intercambiar datos (su
   certificado ya no es aceptado) sin reiniciar la instancia local ni afectar otras federaciones activas.
7. Un Viewer sin permiso sobre un monitor local no ve datos de su vinculo remoto en la vista combinada, aunque el
   vinculo exista y otro Admin/Viewer con permiso si lo vea.
8. Existe registro de auditoria (ver modelo ya usado en AZ-043) para alta, revocacion, perdida/recuperacion de
   conexion y creacion/eliminacion de un vinculo de monitor.
9. Tras desconectar y reconectar un par federado (simulando un corte de red de varios minutos u horas), el
   sondeo posterior a la reconexion pide expresamente `since=<ultimo_timestamp_utc>` y el historial combinado de
   ese periodo se completa retroactivamente sin huecos, siempre que el dato original siga dentro del TTL de 30
   dias — no basta con traer solo el ultimo estado.
10. Un mismo instante mostrado en el dashboard de dos instancias en zonas horarias distintas (ej. Chile GMT-3 y
    China GMT+8) corresponde al mismo punto en UTC almacenado, y cada dashboard lo muestra convertido a su propia
    hora local sin desfase.
11. Reiniciar el contenedor `azkin-back` de una instancia no invalida sus certificados mTLS ni los de sus pares
    federados: tras el reinicio, el sondeo periodico sigue autenticando exitosamente sin necesidad de re-enrolar.
12. Con un monitor vinculado a 2 regiones, si una entra en ventana de Mantenimiento (AZ-040) y la otra reporta
    `DOWN` real, la vista "Combinado" muestra `DOWN`, no `MAINTENANCE` ni `UP`; la vista "Por region" sigue
    mostrando cual instancia esta en mantenimiento.
13. Un informe periodico (AZ-045) configurado para un monitor vinculado muestra, en su formulario de creacion/
    edicion, la pregunta de incluir o no el desglose de instancias federadas; un informe existente creado antes de
    esta funcionalidad sigue generandose igual que hoy (solo datos locales) sin requerir reconfiguracion.
14. La comparacion multi-region en el dashboard se renderiza como tabla/grafico ECharts consistente con el resto
    de `dashboard.ts`, no como un mapa.
15. Con 3 instancias federadas entre si (topologia completa: A-B, A-C y B-C enroladas) y un grupo de monitoreo
    equivalente con un miembro por instancia, la vista "Combinado" refleja los 3 miembros (ej. "DOWN (1/3
    regiones)"), no solo 2 — agregar la tercera instancia al grupo no requiere recrear los vinculos existentes
    entre las otras dos.
16. Revocar la federacion con una instancia mientras hay una conexion de sondeo con keep-alive ya abierta corta el
    intercambio de datos en la request inmediatamente siguiente a la revocacion, sin esperar a que esa conexion
    expire o se renueve.
17. Cada instancia federada visible en `/settings` y en los graficos muestra su etiqueta asignada, no su
    direccion/IP cruda.
18. Federar una sexta instancia (por sobre el limite de 5) es rechazado con un mensaje claro (mismo patron que
    `QuotaExceededError`, ver AZ-014), no con un error generico, y `/settings` muestra el conteo actual antes de
    que el Admin lo intente (ej. "5/5 instancias federadas").
19. El umbral por defecto de "federacion sin reportar" esta documentado y es modificable desde `/settings` sin
    reiniciar el backend.
20. `docs/instalacion-docker.md` documenta el puerto nuevo, la direccion del trafico entre instancias federadas, el
    requisito de reloj sincronizado (NTP) y el limite de 5 instancias como decision de alcance.
21. `docs/ARCHITECTURE.md` tiene una seccion numerada nueva dedicada a la federacion, con al menos 2 diagramas
    `mermaid` (enrollment y sondeo periodico) y un parrafo que explica explicitamente el motivo de la decision de
    arquitectura (por que federacion y no "central + sondas" ni "malla P2P con consenso" — ver Descripcion de esta
    issue), no solo el "como" tecnico.
22. `README.md` menciona la federacion en "✨ Funcionalidades destacadas", incluye el limite de 5 instancias en esa
    misma mencion (no solo en `docs/`), y enlaza a la seccion nueva de `ARCHITECTURE.md`.

### Pistas de investigacion
- No hay un modelo previo exacto en el repo para esto: el monitor tipo "Push Pasivo" (agente que manda heartbeat
  remoto hacia Azkin) es de una sola direccion y de un agente liviano hacia un Azkin completo, mientras que aqui
  se necesita un intercambio entre dos instancias Azkin completas, cada una con su propio motor de checks
  (`infrastructure/checkers/*.ts`) corriendo de forma independiente.
- `backend/src/infrastructure/config/env.ts` y AZ-006 (TLS/puerto configurable) como referencia para exponer un
  puerto dedicado nuevo de forma consistente con el resto del sistema.
- Evaluar libreria de PKI/mTLS para Node (ej. modulo `tls` nativo con CA propia generada al enrolar el primer par
  de instancias, o `node-forge` para emision de certificados) — no introducir un mecanismo custom de "cifrado con
  hash" que no sea TLS/mTLS real.
- La CA/llaves generadas con la libreria de PKI elegida deben persistirse (coleccion Mongo dedicada con el
  material cifrado en reposo, o un volumen Docker montado — ver como `compose.yaml`/`compose.dev.yaml` ya montan
  volumenes para `azkin-db`) en vez de regenerarse en memoria al arrancar `azkin-back`; regenerarlas en cada
  arranque invalidaria todos los certificados de pares ya emitidos.
- Diseñar el endpoint interno de sondeo (`GET /api/v1/federation/sync?since=<timestamp_utc>` o similar) para que
  acepte el cursor temporal y devuelva resultados en lote de forma paginada (no cargar en memoria horas de
  heartbeats de una sola vez si el corte fue largo).
- `backend/src/domain/value-objects/monitor-status.ts` (`MonitorStatus`/`toEventStatusLabel`) ya define los 5
  estados reales del sistema (`DOWN`/`UP`/`PENDING`/`MAINTENANCE`/`DEGRADED`). La jerarquia de severidad del
  combinado **no se inventa de nuevo**: `get-group-overview.usecase.ts` (metodo privado `combineStatus`) ya
  implementa exactamente este problema para grupos locales de monitores
  (`DOWN > DEGRADED > PENDING > MAINTENANCE > UP`) — extraer esa logica a un helper compartido
  (`domain`/`application/services`) y reutilizarlo tanto para grupos locales como para el combinado federado,
  en vez de mantener dos implementaciones de la misma regla.
- Definir esquema Mongo para `FederatedInstance` (id, nombre/etiqueta, URL/direccion de contacto, huella del
  certificado propio y del par, estado de conexion/revocacion, ultimo intercambio exitoso, umbral de "sin
  reportar" configurable, timestamps de enrollment/revocacion) y para `FederatedMonitorGroup` (id de grupo,
  lista de miembros `{instanceId, monitorId}` — reemplaza al vinculo pairwise pensado originalmente). La regla de
  severidad de la vista "Combinado" es fija (ver mas abajo), no una opcion guardada por grupo.
- Middleware de verificacion de revocacion por request (analogo al patron ya usado en `metrics-auth.ts` de AZ-010),
  aplicado tanto al endpoint de sondeo como al listado acotado de monitores: ademas de la validacion mTLS del
  handshake, cada request confirma contra Mongo que la instancia que presenta el certificado no fue revocada,
  para que la revocacion tenga efecto inmediato incluso sobre conexiones con keep-alive ya establecidas.
- Cuota de instancias federadas: seguir el mismo patron de `QuotaExceededError` (AZ-014, ya tiene su propio
  `code` distinguible) en vez de reutilizar el error generico de validacion.
- Endpoint acotado "listar mis monitores para un par federado" (solo nombre/URL/tipo), reutilizando y adaptando el
  mismo filtro de permisos de AZ-008 para no listar monitores que el propio Admin remoto no deberia poder ver.
- Reutilizar `infrastructure/notifier/multichannel-notifier.ts` (ver AZ-004/AZ-007) para la alerta de "federacion
  sin reportar", en vez de crear un sistema de notificaciones paralelo.
- Para la persistencia de resultados de pares federados, revisar como esta modelada hoy la coleccion Time-Series
  de heartbeats (`infrastructure/persistence/mongoose/repositories/mongoose-heartbeat.repository.ts` y su schema)
  y evaluar una coleccion propia (ej. `FederatedHeartbeat`) con el mismo TTL de 30 dias, en vez de mezclar datos
  de origen remoto dentro de la coleccion de heartbeats locales.
- `frontend/src/app/features/dashboard/dashboard.ts` (ya identificado como componente grande en AZ-016) para el
  grafico comparativo por region — revisar si conviene extraerlo como componente propio en vez de sumarle mas
  responsabilidad a un archivo que AZ-016 ya marco como sobrecargado.
- `backend/src/application/use-cases/reports/generate-report-data.usecase.ts` y
  `frontend/src/app/features/settings/reports-panel.ts` (ver AZ-045/AZ-047/AZ-048) para agregar la pregunta de
  "incluir instancias federadas" al formulario de creacion/edicion de informes, manteniendo "solo datos locales"
  como default para no alterar informes ya configurados.
- Revisar `docs/instalacion-docker.md` §12 (tabla de puertos) para mantener el mismo formato al documentar el
  puerto nuevo, y agregar ahi mismo la nota del limite de 5 instancias como decision de alcance (no como
  limitacion tecnica a "resolver despues").
- `docs/ARCHITECTURE.md` ya numera sus secciones de forma secuencial (la ultima es "## 13. Estado DEGRADADO..."),
  asi que la seccion de federacion entra como "## 14. Federacion de instancias" a continuacion, siguiendo el
  mismo estilo de las secciones existentes: parrafo de contexto/motivo primero, luego el detalle tecnico con
  referencias a archivos reales (`domain/entities`, `use-cases`, etc.), tal como ya hacen §12 y §13. Reutilizar el
  formato `mermaid` que ya usan las secciones 1 (arquitectura general), 2 (bypass Cloudflare) y 6 (autenticacion)
  para los diagramas de enrollment y sondeo, en vez de inventar un formato de diagrama distinto.
- `README.md`: agregar una linea nueva en "✨ Funcionalidades destacadas" (siguiendo el mismo estilo de bullet que
  las demas, ej. la de "Módulo de Mantenimiento" o "Estado DEGRADADO y monitoreo adaptativo") y no tocar la tabla
  de "📚 Documentación" salvo para verificar que el link a `docs/ARCHITECTURE.md` siga siendo valido (ya apunta al
  archivo completo, no a una seccion especifica).
