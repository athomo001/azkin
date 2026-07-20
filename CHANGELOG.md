# Changelog

Todos los cambios notables de **Azkin** se documentan aquí.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y sigue [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added
- **Eliminación permanente de API Keys:** además de "Revocar" (invalida la key de inmediato pero la conserva en el listado), ahora existe "Eliminar" en `/settings` → pestaña **API**, que la borra por completo (`DELETE /api/v1/api-keys/:id/purge`). Acción auditada e irreversible, con confirmación explícita antes de ejecutarse.
- **Mostrar/ocultar contraseña en el login:** botón con ícono de ojo en el campo de contraseña de `/login`, igual que el resto de formularios de la industria — antes no había forma de verificar lo escrito antes de enviar el formulario.
- **Fallback automático a `host.docker.internal` en los checkers HTTP/Puerto/Ping:** monitorear un servicio que corre en el mismo servidor físico que Azkin podía marcar falsamente "caído" si su IP LAN no era alcanzable desde dentro del contenedor (depende del firewall/red del host) — un problema invisible para quien configura el monitor, que solo puso la IP real del servicio. Ahora, si el target es una IP privada (RFC 1918) y el error es de conexión (no una respuesta real del servicio), el checker reintenta una vez vía `host.docker.internal` antes de declarar el monitor caído, y lo deja explícito en el mensaje de estado si tuvo que usarlo. No aplica a dominios/IPs públicas ni a errores HTTP reales (4xx/5xx), para no enmascarar caídas genuinas. Ver [`docs/instalacion-docker.md`](docs/instalacion-docker.md) §10.
- **Checkbox "Este objetivo vive en el mismo servidor que Azkin" en el formulario de monitor (HTTP/Ping/Puerto):** cubre el caso en que el target del fallback automático de arriba es un **dominio/hostname** (no una IP privada literal) que resuelve al propio servidor — algo que la detección automática no puede inferir por sí sola. Al marcarlo, aparece una leyenda explicando qué hace y por qué, y el backend usa `host.docker.internal` como fallback aunque el target no sea una IP privada.

### Fixed
- **`AZKIN_FIRST_ADMIN_NAME` no hacía nada:** el seeder del primer administrador (`seed-first-admin.ts`) leía la variable desde el `.env` pero nunca la pasaba al crear el usuario, así que el admin inicial quedaba sin `username` — intentar iniciar sesión con el nombre configurado (en vez del email) siempre fallaba con "Credenciales incorrectas", silenciosamente. Ahora `AZKIN_FIRST_ADMIN_NAME` se persiste como `username` del admin creado, utilizable en el campo "Correo o Usuario" del login igual que ya funcionaba para los Viewers.

### Changed
- **Aislamiento de red Docker y limpieza de variables de entorno:** `azkin-db`, `azkin-back` y
  `azkin-front` ahora comparten una red bridge dedicada (`azkin-network`) en vez de la red
  `default` de Compose. El backend siempre se conecta a Mongo internamente vía `azkin-db:27017`,
  nunca por un puerto de host. `azkin-db` publica un puerto adicional en el host (`27017` por
  defecto, `AZKIN_MONGO_PORT` para cambiarlo) solo para depuración directa (Compass, mongosh),
  enlazado exclusivamente a `127.0.0.1` — no alcanzable desde la red, y con número configurable
  para no chocar con otro Mongo local en el mismo servidor. `AZKIN_MONGO_URI` ya no se define en
  `.env`: el
  compose la construye automáticamente a partir de `AZKIN_MONGO_USER`/`AZKIN_MONGO_PASSWORD`,
  eliminando una fuente de desincronización si se cambiaban las credenciales sin actualizar la URI
  a mano. Se eliminó `AZKIN_VERSION` (no se leía en tiempo de ejecución — `/health` toma la
  versión de `backend/package.json`). `AZKIN_PORT` se renombró a `AZKIN_BACK_PORT` para el mapeo
  de puerto del host, dejando `AZKIN_PORT` como una constante interna del contenedor (siempre
  `3000`, ya no configurable desde `.env`). **Acción requerida al actualizar:** si tu `.env`
  existente define `AZKIN_PORT`, `AZKIN_MONGO_URI` o `AZKIN_VERSION`, esas líneas ya no se leen —
  reemplázalas siguiendo [`docs/instalacion-docker.md`](docs/instalacion-docker.md).
- **Descomposición de `settings.ts` y `dashboard.ts` (AZ-016):** ambos componentes "Dios" del frontend se dividieron en subcomponentes por dominio. `settings.ts` pasó de 1897 a 171 líneas (6 pestañas extraídas a componentes propios: TLS, Auditoría, API Keys, Respaldos, Viewers, Alertas) y ganó dos servicios/componentes compartidos nuevos (`ConfirmService`/`ConfirmModalComponent`, `ToastService`/`ToastComponent`). `dashboard.ts` pasó de 2291 a 1580 líneas (KPIs/incidentes, navbar y formulario de alta/edición de monitor extraídos a componentes propios); la parte más entrelazada (gráficos ECharts, panel de detalle, árbol de monitores del sidebar) queda documentada como remanente pendiente en `ISSUES.md` (AZ-016).

## [1.2.0] - 2026-07-19

Release grande: cierra una auditoría de seguridad crítica, un lote de 8 mejoras de UX/funcionalidad
y una auditoría completa de calidad de código/deuda técnica (backend y frontend). Ver `ISSUES.md`
para el detalle punto por punto de cada item (`AZ-008` a `AZ-032`).

### Added
- **API pública con API Keys:** nuevo prefijo `/api/public/v1/monitors` autenticado por header `X-API-Key` (scopes `read`/`write`), pensado para integrar sistemas externos (Grafana, scripts, CI/CD) sin usar una sesión de usuario. Gestión de keys desde `/settings` → pestaña **API** (generar, listar por `keyPrefix`, revocar). Solo se persiste el hash SHA-256 de cada key; el valor en claro se muestra una única vez al crearla. Documentación completa con ejemplos `curl` en [`docs/api-publica.md`](docs/api-publica.md).
- **Gestión de otras cuentas Administrador:** editar email, resetear contraseña, bloquear/desbloquear y eliminar otras cuentas Admin desde `/settings` (con protección de auto-bloqueo/auto-eliminación). Un admin bloqueado no puede iniciar sesión ni renovar su token.
- **Importación masiva de monitores vía CSV:** arrastrar y soltar un `.csv` (o plantilla descargable) en la pestaña Respaldos; a diferencia de la restauración de un backup JSON, una fila inválida no descarta el resto del lote — se reportan los errores por fila y se importan las válidas.
- **Historial de auditoría consultable:** nueva pestaña "Auditoría" en `/settings` y endpoint `GET /api/v1/audit-log` — antes los eventos sensibles (borrado masivo, cambios de TLS, recuperación de contraseña) se registraban en Mongo pero no había forma de consultarlos sin conectarse a la base de datos.
- **Estado y prueba del SMTP de aplicación:** nueva sección en `/settings` que muestra si el SMTP usado para recuperación de contraseña está configurado (sin exponer la contraseña) y permite enviar un correo de prueba real antes de que un usuario lo necesite.
- **Modo TV / Kiosko 4K:** las sesiones con `isTvSessionEnabled` ahora reciben un token de sesión de 1 año (antes el flag no tenía ningún efecto) y activan un modo visual con fuentes/espaciados ampliados para lectura a distancia, ocultando controles no esenciales.
- **Certificados TLS por archivo:** además de pegar el PEM como texto, cada campo (certificado, clave privada, cadena intermedia) admite subir un archivo.
- **Plantillas de notificación mejoradas:** cheatsheet de variables clickeable (inserta `{{variable}}` en la posición del cursor) y selector de emojis, dentro del editor de plantillas por evento.
- **Sesión renovable vía cookie segura:** `POST /auth/refresh` y `POST /auth/logout` quedaron completamente implementados — el login ahora emite, además del access token, un refresh token de 7 días (1 año en sesiones TV) persistido como cookie `HttpOnly`/`SameSite=Lax`, rotado en cada renovación.

### Changed
- **El token de acceso ya no se persiste en `localStorage`:** vive solo en memoria; la sesión se rehidrata tras recargar la página llamando a `/auth/refresh` (que lee la cookie `HttpOnly`, inaccesible a JavaScript). Mitiga el robo de sesión vía XSS.
- **Formulario de canal de alerta sin saltos visuales:** layout de 2 columnas basado en el ancho real de la tarjeta (`@container`, no en el viewport) — los campos específicos de cada canal (Slack/Telegram/Email/Webhook) ya no reordenan el resto del formulario al cambiar de tipo, y ya no se comprimen de forma ilegible cuando la tarjeta ocupa una fracción angosta de una pantalla ancha.
- **Métricas Prometheus (`/metrics`) endurecidas:** sin credenciales por defecto en el código (antes usaba `prom_scraper`/una contraseña de ejemplo si no había nada configurado); comparación de credenciales en tiempo constante; la API Key solo se acepta por header (ya no por query string, que quedaba en logs de acceso).
- **Rate limiting en autenticación:** `/register`, `/login`, `/forgot-password` y `/reset-password` limitan a 10 intentos cada 15 minutos por IP.
- **Notificaciones:** `GET/POST/PUT /notifications` enmascaran los campos sensibles del `config` (`webhookUrl`, `botToken`, `smtpPassword`), mostrando solo los últimos 4 caracteres; el formulario de edición sigue funcionando de forma transparente (el backend reconoce el valor enmascarado y conserva el secreto real si no se modificó).
- **`AZKIN_CORS_ORIGIN` ya no tiene un valor por defecto permisivo:** debe configurarse explícitamente (puede seguir siendo `"*"` en desarrollo, pero como decisión consciente, con warning de arranque).
- **Costo de bcrypt configurable** vía `AZKIN_BCRYPT_COST` (antes fijo en 10).
- Refactor amplio de calidad de código: unificación de la política de acceso a monitores en un único helper, eliminación de tipado `any` en el borde HTTP/JWT/notificador multicanal (tipos discriminados por canal), eliminación de lógica de negocio y acceso directo a Mongoose desde `composition-root.ts`/`stats.controller.ts`, helpers compartidos de mapeo Mongoose→dominio y extracción de mensajes de error, función única de normalización de estado de monitor (antes duplicada y divergente en 6 puntos) y de extracción de errores HTTP (antes producía literalmente `"[object Object]"` en un toast).

### Fixed
- **Vulnerabilidad crítica:** un usuario con rol Viewer podía navegar directamente a `/settings` y, en algunos endpoints, invocar rutas de administración — el frontend solo ocultaba los controles visualmente. Ahora `/settings` exige rol Admin (frontend y backend) y existe `/profile` para que cualquier rol autenticado gestione su propia cuenta.
- **El tema claro/oscuro se reseteaba a oscuro** al refrescar la página en `/settings` o `/profile` (el tema solo se aplicaba desde el Dashboard).
- **`domainExpiry` fabricado:** el "días hasta vencimiento del dominio" mostrado en la UI se calculaba con un hash determinístico del hostname, no con una consulta WHOIS/RDAP real. Se eliminó el cálculo falso; el campo ahora es `null` (mostrado como "no disponible") hasta que exista una fuente de datos real.
- **Código de error de cuota indistinguible:** `QuotaExceededError` reutilizaba el mismo código que un error de validación genérico; ahora tiene su propio código (`QUOTA_EXCEEDED`).

### Security
- Ver la sección *Changed* — endurecimiento de `/metrics`, rate limiting, CORS explícito, costo de bcrypt configurable, enmascarado de secretos de canales de notificación y migración del token de sesión fuera de `localStorage` son, en conjunto, el cierre de la auditoría de seguridad de esta release.

## [1.1.0] - 2026-07-18

### Added
- **Recuperación de contraseña:** flujo completo (solicitud + token de un solo uso + cambio) con mensajes anti-enumeración; el registro público de administradores queda deshabilitado tras crearse el primer admin (auto-bootstrap).
- **Plantillas de notificación por canal:** email, webhook, Telegram, Slack y Discord admiten plantillas configurables por tipo de evento con variables dinámicas y vista previa.
- **Enrutamiento centralizado de alertas:** cada canal puede suscribirse a "todas las alertas" o a una selección de eventos (`DOWN`, `RECOVERED`, `LATENCY_HIGH`, `DEFACEMENT`).
- **Respaldos persistidos:** estrategia de "acumular" o "reemplazar último respaldo" al generar copias de seguridad, con listado y descarga de respaldos guardados.
- **Borrado masivo de monitores:** selección múltiple en el dashboard con confirmación y resumen de impacto.
- **TLS/HTTPS nativo:** el backend admite un listener HTTPS configurable (certificado, clave, cadena intermedia y puerto) gestionado desde la UI de administración, con auditoría de cambios.
- **Auditoría mínima:** registro de acciones administrativas sensibles (borrado masivo, reemplazo de respaldos, cambios de TLS, recuperación de contraseña).
- **Endpoint de versión:** `GET /health` expone la versión desplegada; el login muestra la misma versión.

### Fixed
- **Permisos de Viewer:** los permisos (`all`/`group`/`monitor`) ahora se incluyen en el token de sesión — antes un Viewer con permisos configurados no veía ningún monitor. Las rutas de escritura de monitores, viewers, respaldos y notificaciones ahora exigen rol Admin (antes cualquier Viewer autenticado podía crear/editar/eliminar monitores).

## [1.0.0] - 2026-07-16

### Added
- **Monitoreo SNMP v1/v2c/v3:** Implementación básica para configuración y lectura de OIDs en equipos de red.
- **Canales de Alerta (SMTP/SMTP Seguro):** Formulario avanzado en el panel de configuración para el envío de alertas de caída mediante servidor SMTP y notificaciones multicanal.
- **Bypass de Cloudflare WAF:** Capacidad de detección inteligente de proxies de Cloudflare (estados 403/503 con firmas CF), marcando la conexión como `UP (CF WAF)` en lugar de reportar caídas falsas.
- **Modo Nyan Cat (Easter Egg):** Activación visual en los gráficos de latencia. Un Nyan Cat animado de gran escala (`[85, 52]`) vuela en tiempo real siguiendo el último punto de latencia registrado.
- **Efecto de Transición de Tema (Claro/Oscuro):** Implementación de View Transitions API con efecto de círculo envolvente que se propaga desde la posición del cursor en ambas direcciones.

### Changed
- **Nombres de Contenedores Docker:** Modificados a nombres estáticos semánticos: `azkin-front`, `azkin-back` y `azkin-db`.
- **MongoDB 8.x:** Actualización del motor de base de datos de la versión 7 a la 8 en todos los entornos Docker compose.
- **pnpm 11.13.1:** Actualización global y del `packageManager` en el frontend para forzar el uso de la versión de pnpm más reciente.
- **Panel de Configuración `/settings` Premium:** Rediseño estilo SaaS premium inspirado en Vercel, con sub-menús horizontales dinámicos y pie de acciones a la derecha.
- **Visualización de Gráficos de Grupo:** Aumento de fuentes y tamaño de leyenda con bloques de color grandes y legibles, diseñado para su visualización en pantallas gigantes (TV).
- **Eliminación de Alertas Nativas:** Reemplazo de los diálogos `alert()` del navegador por modales de confirmación personalizados y notificaciones interactivas (toasts).

### Fixed
- **Validación de URL:** Autocompletado automático de protocolos `http://` / `https://` y validación de sintaxis en el guardado de monitores.
- **Renderizado Reactivo de Gráficos:** Vinculación de efectos de Angular (`effect()`) para forzar la actualización inmediata de los gráficos de ECharts al cambiar el tema o el modo Nyan Cat sin recargar la página (cero F5).
- **Caché e Instantaneidad en SSL/WHOIS:** Optimización en las verificaciones periódicas de certificados y dominios para evitar tiempos de espera prolongados.
