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
- **Tiempo Real:** Socket.io restringido exclusivamente a `rooms` basados en el `user_id` (Aislamiento estricto para entorno multiusuario).
- **Frontend:** Angular (v17+) usando _Standalone Components_ (sin `NgModules`) y señales (_Signals_) para un manejo de estado reactivo y moderno.
- **Implementacion** sea utilizando Docker , crearemos el archivo docker y lo ejecutaremos con docker compose

---

### Fase 2: Modelado de Datos (MongoDB y Mongoose)

Genera las Interfaces (TypeScript) y los Schemas de Mongoose considerando:

- **Aislamiento total:** Todo documento (`Monitor`, `Heartbeat`) debe estar referenciado a un `user_id` (ObjectId).
- **Colecciones principales:** `User` (Autenticación), `Monitor` (con tipos: http, ping, port).
- **Manejo de Tags:** Los tags deben ser un array de strings (`tags: [String]`) dentro del Schema del `Monitor` para facilitar consultas rápidas sin requerir colecciones adicionales.
- **Optimización Crítica:** La colección de `Heartbeat` (que guarda el status UP/DOWN, latencia y timestamp) debe ser configurada explícitamente como una **Time Series Collection** a nivel de MongoDB (usando `timeseries: { timeField: 'timestamp', metaField: 'monitorId', granularity: 'minutes' }`), con una caducidad automática de 30 días (`expireAfterSeconds`).

---

### Fase 3: Contratos de la API REST

Todos los endpoints (excepto Auth) deben estar protegidos por un Middleware que extraiga el `user_id` del token JWT para asegurar el aislamiento.

- **Autenticación (`/api/auth`):**
- `POST /register` y `POST /login`: Retornan un JWT.

- **Gestión de Monitores (`/api/monitors`):**
- `GET /`: Retorna la lista de todos los monitores del `user_id` autenticado (sin heartbeats).
- `POST /`: Crea un nuevo monitor (`name`, `type`, `target`, `interval`, `tags`).
- `PUT /:id`: Actualiza configuración (ej. pausar con `isActive`).
- `DELETE /:id`: Elimina un monitor y sus registros en cascada.

- **Dashboards y Estadísticas (`/api/stats`):**
- `GET /monitor/:id/history`: Retorna el historial de _heartbeats_ de las últimas 24 horas.
- `GET /tags`: Retorna tags únicos del usuario.
- `GET /tags/:tagName/overview`: Retorna un consolidado de todos los monitores bajo un tag (estado general, latencia promedio y array histórico promediado).

---

### Fase 4: Arquitectura UI/UX y Frontend (Angular)

El diseño debe tener una estética premium, inspirada en herramientas modernas (como Vercel o Supabase), evitando verse como una plantilla genérica.

- **Estilo General:** Usa **Tailwind CSS**. Soporte nativo a Dark Mode (grises oscuros, acentos verde esmeralda para "UP" y rojo carmesí para "DOWN"). Layout limpio, alto contraste, tipografía sans-serif moderna.
- **Vistas Principales:**
- `GlobalDashboardView`: Grilla de tarjetas de resumen y métricas globales.
- `TagDashboardView` **[Feature Core]**: Vista consolidada `/dashboard/tag/:tagName` con un gráfico gigante (Apache ECharts) que muestra la salud combinada de esa etiqueta y la lista de monitores específicos debajo.
- `MonitorDetailView`: Gráfica de latencia individual, historial de errores y formulario de edición.
- **Componentes Reutilizables:** `StatusBadgeComponent` (pill visual de estados) y `LatencyChartComponent` (wrapper reactivo de ECharts).
- **Estado:** Usa un `MonitorStateService` con `Signal<IMonitor[]>` y un `SocketService` para actualizar los gráficos en tiempo real cuando se reciba el evento `ping_result` desde el backend.

---

### Fase 5: El Motor de Monitoreo (Backend Core)

- **Orquestador (`SchedulerService`):** Al arrancar, carga monitores activos y agenda un `setInterval` en memoria (`Map<string, NodeJS.Timeout>`) basado en el intervalo de cada uno.
- **Control de Concurrencia:** Las peticiones HTTP deben envolverse en un limitador (ej. `p-limit(50)`) para que Node.js no dispare miles de pings en el mismo milisegundo y ahogue el servidor.
- **Flujo del Ping:** Ejecuta petición -> Mide latencia -> Persiste en la colección Time Series -> Emite por WebSocket a la sala del usuario (`io.to(userId).emit(...)`) -> Si cambia de UP a DOWN, dispara sistema de alertas.

---
