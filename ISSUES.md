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

### UX / Funcionalidad (batch post-auditoria de seguridad)

| Codigo | Titulo | Prioridad | Estado |
|---|---|---|---|
| [AZ-033](#az-033-benchmark-uxui-y-propuesta-de-identidad-visual-diferenciada-frente-a-uptime-robot-y-uptime-kuma) | Benchmark UX/UI y propuesta de identidad visual diferenciada frente a Uptime Robot y Uptime Kuma | Frontend | Media | [ ] Abierto |

### Calidad de codigo / deuda tecnica (auditoria senior)

| Codigo | Titulo | Area | Prioridad | Estado |
|---|---|---|---|---|
| [AZ-016](#az-016-componentes-dios-en-el-frontend-dashboardts-2300-lineas-y-settingsts-1180-lineas-sin-descomposicion) | Componentes "Dios": `dashboard.ts` (~2300L) y `settings.ts` (~1180L) | Frontend | Media-Alta | [~] Mayormente resuelto |

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
1. `dashboard.ts` se descompone en subcomponentes presentacionales — hecho parcialmente:
   `QuickStatsPanelComponent`, `DashboardNavbarComponent`, `MonitorFormComponent` extraidos.
   `MonitorDetailPanel`/`MonitorChart` (ECharts + seleccion) quedan fuera de alcance, ver nota.
2. `settings.ts` se descompone por pestana/dominio — hecho, las 6 pestanas extraidas.
3. Cada subcomponente cabe holgadamente en una sola pantalla de revision de codigo (referencia orientativa: <400 lineas) — cumplido en todos los subcomponentes nuevos.

### Criterios de aceptacion
1. `settings.ts` queda por debajo de ~400-500 lineas — cumplido (171 lineas). `dashboard.ts` baja de 2291 a 1580 lineas pero no llega al rango objetivo porque el remanente entrelazado (charts + panel de detalle + sidebar) queda fuera de alcance, ver nota.
2. Cada subcomponente extraido es importable/testeable de forma aislada — cumplido.
3. La build de Angular (`ng build`) sigue pasando sin regresiones visuales tras la extraccion — verificado por build para ambas fases; falta la confirmacion visual del usuario en navegador para la Fase 2 (dashboard).

### Pistas de investigacion
- `frontend/src/app/features/dashboard/dashboard.ts` (remanente: charts ECharts, panel de detalle, sidebar) y `frontend/src/app/features/settings/settings.ts` (completo).
- Aprovechar una futura sesión con navegador disponible para anadir las primeras pruebas unitarias (ver AZ-019) a los subcomponentes nuevos.

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

## AZ-049) Federacion de instancias Azkin independientes en distintas regiones geograficas, con vista de monitoreo combinada y comunicacion cifrada por enrollment
- Codigo: AZ-049
- Estado: [~] En progreso — slices 1 y 2 resueltas (enrollment, mTLS, sondeo, vinculos, UI); pendiente solo Informes (AZ-045)
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

### Progreso (slice 2 — puerto dedicado, sondeo, vinculos y UI)
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
