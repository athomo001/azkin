# Reporte de Ingeniería Inversa: Mapeo de Dependencias y Flujos de Datos en Uptime Kuma

Este documento proporciona una autopsia técnica del mapa de dependencias y de los flujos de datos de bajo nivel de **Uptime Kuma**, analizando el rol específico de cada biblioteca y cómo interactúan los flujos de información en el sistema.

---

## 1. Mapeo Crítico de Dependencias y Tecnologías

El archivo `package.json` revela que Uptime Kuma es un integrador de múltiples protocolos de red y almacenamiento. A continuación, se detalla la función de cada dependencia crítica:

### 1.1 Protocolos de Red y Motores de Chequeo
* **`@louislam/ping` y `tcp-ping`**: 
  * Utilizados para enviar paquetes ICMP Echo Request y validar latencia cruda (RTT). `@louislam/ping` es un fork modificado de la biblioteca nativa para dar soporte a sistemas multiplataforma en contenedores con permisos reducidos.
* **`@grpc/grpc-js` y `protobufjs`**:
  * Implementa clientes gRPC dinámicos. Carga archivos `.proto` en caliente a través de `protobufjs` para serializar/deserializar tramas binarias HTTP/2 y validar si los servicios de microservicios gRPC responden correctamente.
* **`net-snmp`**:
  * Utilizado para consultas SNMP (Simple Network Management Protocol). Realiza peticiones GET/WALK a dispositivos de infraestructura (routers, switches) para comprobar su estado de salud de red basándose en OIDs específicos.
* **`radius` y `node-radius-utils`**:
  * Implementa autenticación AAA contra servidores RADIUS (puerto 1812), enviando paquetes Access-Request de red y evaluando respuestas (Access-Accept / Access-Reject).
* **`gamedig`**:
  * Biblioteca especializada en consultar servidores de videojuegos (Steam, Minecraft, Source, etc.). Envía payloads binarios UDP propietarios para recuperar metadatos de salas de juego (jugadores activos, mapa, estado del servidor).
* **`mqtt`**:
  * Suscribe y publica tramas a brokers de mensajería IoT (puerto 1883/8883) para validar la latencia del canal de mensajería mediante temas (`topics`) configurados por el usuario.
* **`kafkajs`**:
  * Valida la capacidad de respuesta de clústeres de Apache Kafka simulando ser un productor que escribe un payload en un tema determinado.

### 1.2 Capa de Datos y Soporte Multi-Base de Datos
* **`redbean-node`**:
  * ORM no tradicional. No requiere de esquemas declarativos rígidos. Utiliza una arquitectura basada en "beans" y metadatos dinámicos para construir consultas sobre la marcha.
* **`knex`**:
  * Generador de consultas SQL (*query builder*) que proporciona la capa de inicialización del esquema físico y las migraciones necesarias al cambiar de versión el software.
* **`@louislam/sqlite3`**:
  * Motor embebido por defecto. Es un fork compilado estáticamente para evitar problemas de compatibilidad binaria de Node-gyp en diferentes sistemas operativos y entornos de contenedores.
* **Drivers Relacionales (`pg`, `mysql2`, `mssql`, `oracledb`)**:
  * Habilitan la capacidad de conectarse a bases de datos relacionales externas cuando el usuario cambia el tipo de motor en `setup-database.js`.

### 1.3 Control de Flujo de Eventos y Programación
* **`croner`**:
  * Reemplaza los cronjobs nativos del sistema operativo. Mapea expresiones de tipo cron (`* * * * *`) a eventos asíncronos en Node.js, utilizado principalmente para las ventanas de mantenimiento en `server/model/maintenance.js`.
* **`limiter`**:
  * Implementa el algoritmo del cubo de tokens (*Token Bucket*) para el control de tasas (Rate Limiting) de las conexiones WebSocket entrantes en Socket.io.
* **`tough-cookie` e `http-cookie-agent`**:
  * Maneja de manera persistente las cookies HTTP entre llamadas de monitoreo sucesivas en los monitores tipo `http`. Esto permite simular sesiones de usuario completas que requieren iniciar sesión previamente.

---

## 2. Flujo de Datos Detallado (Análisis Operativo)

### 2.1 Flujo de Creación y Arranque de un Monitor
Cuando el usuario interactúa con la interfaz para crear un nuevo monitor:

```
[UI Angular/Vue]
     │ (1) socket.emit("add", monitorPayload)
     ▼
[server.js]
     │ (2) Transforma Payload a Bean de RedBean (R.dispense("monitor"))
     ▼
[server/model/monitor.js]
     │ (3) R.store(monitorBean) -> Guarda en base de datos (SQLite/MariaDB)
     │ (4) Invoca a monitor.start(io)
     ▼
[Inicializa Bucle safeBeat()]
     │ (5) Asigna setTimeout para ejecutar el primer check
     ▼
[Estado Activo en Memoria (server.monitorList)]
```

### 2.2 Flujo de Ejecución del Check de Red y Procesamiento del Heartbeat
Cada iteración del bucle `safeBeat` sigue el siguiente curso de datos:

```
                  ┌──────────────────────────────┐
                  │      Ejecución de safeBeat   │
                  └──────────────┬───────────────┘
                                 │
                 [¿Está bajo mantenimiento?]
                 ├── Sí ──> Setea status = MAINTENANCE
                 └── No
                       │
             [Selecciona Tipo de Monitor]
             ├── "http" ──> Hace petición Axios con cookies y auth
             ├── "ping" ──> Ejecuta socket raw ICMP (@louislam/ping)
             └── "específico" ──> Delegado a monitor-types/ (Ej: postgres.js)
                       │
             ┌─────────┴─────────┐
             │ ¿Error en Check?  │
             └────┬──────────┬───┘
                  │          │
                 Sí         No
                  │          │
                  │         [Status = UP]
                  │         Calcula ping (ms)
                  │         Setea msg = HTTP status (ej: "200 - OK")
                  │
                  ▼
            [Status = DOWN]
            Evalúa reintentos (retries)
            setea msg = error.message (ej: "timeout")
                  │
                  ├────────────────────────────────────────┐
                  ▼                                        ▼
      [Persistencia del latido]                  [Dispara Alertas]
      R.dispense("heartbeat")                    ¿Cambió el estado importante?
      R.store(heartbeatBean)                     ── Sí ──> Notification.send()
                                                                 │
                                                       [LiquidJS Template Engine]
                                                                 │
                                                       [notification-providers/]
```

### 2.3 Flujo de Notificación Externa
1. **Detección de Cambio**: `Monitor.js` compara el estado de la iteración anterior (`previousBeat.status`) con el estado actual (`bean.status`).
2. **Filtro de Importancia**: Si pasa de UP a DOWN o viceversa, se cataloga el latido como "importante".
3. **Renderizado de Plantilla**: `Notification.js` recupera las plantillas de mensaje del usuario, carga el contexto del monitor y del latido, e invoca al motor de plantillas **LiquidJS** para generar los mensajes formateados.
4. **Envío de Red**: Invoca al proveedor asignado (ej: `discord.js`, `telegram.js`), configurando de manera dinámica los proxies de red HTTP/Socks en caso de que existan variables de proxy del sistema configuradas.
5. **Registro de Historial**: Se inserta un registro en la tabla `notification_sent_history` para evitar el reenvío redundante de notificaciones en un periodo de tiempo específico.
