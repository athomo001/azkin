# Documento Maestro de Especificaciones (SDD): Proyecto AZKIN

**Rol y Objetivo**
Actúa como un Arquitecto de Software Senior y un Diseñador UI/UX experto. Vamos a construir **Azkin**, una plataforma de monitoreo de infraestructura diseñada desde cero para ser nativamente multiusuario, eficiente, sin sobreingeniería y visualmente impecable.

**Metodología Obligatoria: Spec-Driven Development (SDD)**
No generes código de implementación funcional de inmediato. Trabajaremos en fases estrictas. Espera mis instrucciones para avanzar de una fase a la otra.

---

### Fase 1: Especificaciones de Arquitectura y Stack (Ligero y Moderno)

- **Backend:** Node.js con Express y TypeScript estricto. Patrón de Clean Architecture (Dominio, Aplicación, Infraestructura).
- **Base de Datos:** MongoDB utilizando Mongoose.
- **Motor de Tareas (Cero dependencias externas):** Implementar un planificador en memoria utilizando el Event Loop nativo de Node.js, apoyado por un limitador de concurrencia (como `p-limit`) para despachar los pings HTTP sin saturar la red ni la CPU. Nada de Redis o BullMQ.
- **Tiempo Real:** Socket.io restringido a `rooms` basadas en el `user_id` o permisos asignados (Aislamiento estricto y seguro de datos en vivo).
- **Frontend:** Angular en su última versión estable (Angular 19+) usando _Standalone Components_ (sin `NgModules`) y señales (_Signals_) para un manejo de estado reactivo y moderno.
- **Implementación:** Utilizando Docker. Crearemos los archivos correspondientes (`Dockerfile` multi-stage y `compose.yaml` robusto). La orquestación debe ser altamente tolerante a fallos, implementando `healthchecks` cruzados, políticas de reinicio automático (`restart: unless-stopped`), límites de recursos de hardware y tolerancia de reintentos en conexiones de red para evitar que un arranque lento o un fallo temporal detenga o bote los servicios.
- **Roles y Accesos:** Distinción clara entre administradores (`Admin`) con control total, y visualizadores (`Viewer`) con accesos de lectura restringidos. Los `Viewers` destinados a pantallas fijas (ej. TVs de monitoreo) contarán con sesiones de larga duración para evitar la re-autenticación constante.

---

### Fase 2: Modelado de Datos (MongoDB y Mongoose)

Genera las Interfaces (TypeScript) y los Schemas de Mongoose considerando:

- **Aislamiento y Roles:** Todo documento (`Monitor`, `Heartbeat`, `Notification`) pertenece a un `Admin` propietario. Los usuarios tipo `Viewer` acceden únicamente a los recursos autorizados por el Admin.
- **Modelo de Permisos:** El usuario `Viewer` tendrá un listado de permisos asignados en base a: acceso global, filtros por `group` (Grupo de Monitores) específicos, o a un `Monitor` individual.
- **Colecciones principales:** `User` (incluyendo `role` y `permissions`), `Monitor` (con campos `group`, `tags` y `notificationIds`), `Notification` (configuraciones globales de canales de alerta).
- **Manejo de Tags:** Los tags deben ser un array de strings (`tags: [String]`) dentro del Schema del `Monitor` para facilitar consultas rápidas sin requerir colecciones adicionales.
- **Mapeo de Alertas:** Un monitor puede tener múltiples notificaciones asociadas (`notificationIds`). Al cambiar de estado, se disparan en paralelo a través de los canales configurados (SMTP, Discord, Slack, Telegram, Webhook).
- **Optimización Crítica:** La colección de `Heartbeat` (que guarda el status UP/DOWN, latencia y timestamp) debe ser configurada explícitamente como una **Time Series Collection** a nivel de MongoDB (usando `timeseries: { timeField: 'timestamp', metaField: 'monitorId', granularity: 'minutes' }`), con una caducidad automática de 30 días (`expireAfterSeconds`).

---

### Fase 3: Contratos de la API REST

Todos los endpoints (excepto Auth) deben ser protegidos por un Middleware que extraiga el `user_id` del token JWT para asegurar el aislamiento.

- **Autenticación (`/api/auth`):**
- `POST /register` y `POST /login`: Retornan un JWT.

- **Gestión de Monitores (`/api/monitors`):**
  - `GET /`: Retorna la lista de todos los monitores del `user_id` autenticado (sin heartbeats).
  - `POST /`: Crea un nuevo monitor (`name`, `type`, `target`, `interval`, `group`, `tags`, `notificationIds`).
- `PUT /:id`: Actualiza configuración (ej. pausar con `isActive`).
- `DELETE /:id`: Elimina un monitor y sus registros en cascada.

- **Dashboards y Estadísticas (`/api/stats`):**
  - `GET /monitor/:id/history`: Retorna el historial de _heartbeats_ de las últimas 24 horas.
  - `GET /groups`: Retorna los grupos de monitores del usuario.
  - `GET /groups/:groupName/overview`: Retorna el consolidado de un grupo (estado general, latencia e historial individualizado por monitor de las últimas 24 horas).

- **Gestión de Notificaciones (`/api/notifications`):**
  - `GET /`: Lista las notificaciones creadas por el Admin.
  - `POST /`: Crea una notificación (ej: Slack, Discord, Telegram, SMTP, Webhook).
  - `POST /:id/test`: Realiza un envío de prueba para validar credenciales y conectividad.
  - `PUT /:id` y `DELETE /:id`: Edita o elimina la configuración de alertas.

---

### Fase 4: Arquitectura UI/UX y Frontend (Angular)

El diseño debe tener una estética premium, inspirada en herramientas modernas (como Vercel o Supabase), evitando verse como una plantilla genérica.

- **Estilo General:** Usa **Tailwind CSS**. Soporte nativo a Dark Mode (grises oscuros, acentos verde esmeralda para "UP" y rojo carmesí para "DOWN"). Layout limpio, alto contraste, tipografía sans-serif moderna.
- **Estructura Limpia y Semántica (Anti-Divitis):** Queda estrictamente prohibido el abuso de contenedores `div` redundantes u hojas de estilos con divs anidados innecesariamente (práctica común en código generado por IA). Se establecen las siguientes reglas de maquetación:
  * **HTML5 Semántico Obligatorio:** Uso de etiquetas estructurales (`<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, `<article>`, `<footer>`) en lugar de divs genéricos.
  * **Jerarquía DOM Plana (Flat DOM):** Evitar wrappers o divs contenedores cuya única función sea alinear elementos. Se deben aprovechar las propiedades Flexbox y CSS Grid directamente en los contenedores padres semánticos.
  * **Interacción Semántica y Accesible:** Cualquier elemento clickeable debe ser un botón nativo (`<button>`) o enlace (`<a>`), prohibiendo colocar eventos click sobre elementos `div` o `span` sin roles interactivos (`role="button"`, `tabindex`).
- **Vistas Principales:**
  - `GlobalDashboardView`: Grilla de tarjetas de resumen y métricas globales con listado jerárquico colapsable por **Monitor Group** (Grupo de Monitores, ej. Netics).
  - `GroupDashboardView` **[Feature Core]**: Vista consolidada `/dashboard/group/:groupName`.
    - **Gráfico Multilínea:** El componente de latencia muestra líneas de rendimiento superpuestas para **cada monitor individual** del grupo en la misma gráfica para comparación directa.
    - **Desglose de Fallos:** Si el grupo no está 100% funcional (estado de alerta o degradado), se muestra un panel destacado indicando con precisión **qué web o monitor específico ha caído** y el mensaje descriptivo del fallo (ej: `GLPI - DOWN: 502 Bad Gateway` en lugar de un error genérico del grupo).
- `MonitorDetailView`: Gráfica de latencia individual, historial de errores y formulario de edición (solo disponible para Administradores).
  - `SettingsAndBackupView` **[Gestión]**: Panel de configuración general con **sistema de respaldos** (exportación/importación), **consola de asignación de permisos** (para Viewers/TVs) y **NotificationSettingsView** (creación, edición, listado y testeo de integraciones de notificaciones SMTP, Slack, Discord, Telegram y Webhook).
- **Componentes Reutilizables:** `StatusBadgeComponent` (pill visual de estados), `LatencyChartComponent` (wrapper reactivo de ECharts que soporta renderizado extendido y el modo estético opcional Nyan Cat), `BackupManagerComponent` (interfaz visual de importación/exportación de respaldos), `PermissionEditorComponent` (consola de asignación de visibilidad de recursos) y `NotificationFormelComponent` (formulario reactivo dinámico que renderiza inputs condicionalmente según el proveedor seleccionado: `webhookUrl` para Slack/Discord, `botToken` y `chatId` para Telegram, servidor SMTP para Email, y URLs/cabeceras personalizadas para Webhooks genéricos).
- **Personalización Estética (Easter Egg):** Opción configurable **Nyan Cat Mode** en el perfil de usuario. Si está activa:
  - **Identidad del Meme (Nyan Cat):** Hace referencia al meme de internet de un gato en pixel-art 8 bits con cuerpo de galleta Pop-Tart rosa que vuela dejando una estela de arcoíris.
  - **Comportamiento Gráfico:** En `LatencyChartComponent` (Apache ECharts) se reserva un margen derecho extra (`grid.right`) y el marcador del último punto temporal de latencia (`symbol` en ECharts) se reemplaza por el sprite de Nyan Cat (`image://assets/nyan-cat.gif` o SVG equivalente). La línea de tendencia de latencia se estiliza mediante un gradiente de color lineal de estilo arcoíris (rojo, naranja, amarillo, verde, azul, morado) emulando la estela del meme a medida que el gato viaja a través de los datos de respuesta.
- **Estado:** Usa un `MonitorStateService` con `Signal<IMonitor[]>` y un `SocketService` para actualizar los gráficos en tiempo real cuando se reciba el evento `ping_result` desde el backend.

---

### Fase 5: El Motor de Monitoreo (Backend Core)

- **Orquestador (`SchedulerService`):** Al arrancar, carga monitores activos y agenda un `setInterval` en memoria (`Map<string, NodeJS.Timeout>`) basado en el intervalo de cada uno.
- **Control de Concurrencia:** Las peticiones HTTP deben envolverse en un limitador (ej. `p-limit(50)`) para que Node.js no dispare miles de pings en el mismo milisegundo y ahogue el servidor.
- **Flujo del Ping:** Ejecuta petición -> Mide latencia -> Persiste en la colección Time Series -> Emite por WebSocket a la sala del monitor -> Si cambia de UP a DOWN (o viceversa) de forma confirmada tras agotar reintentos, el orquestador consulta los `notificationIds` asociados y despacha en paralelo las alertas a través de `INotifier` a los proveedores activos.

---
