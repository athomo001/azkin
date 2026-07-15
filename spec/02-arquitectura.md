# Fase 1 — Especificación de Arquitectura y Stack: Azkin

> Estado: **Aprobada** · Metodología: Spec-Driven Development (SDD)
> Documento derivado de [`01-general.md`](01-general.md) y del análisis de arquitecturas de referencia.

Este documento fija la arquitectura de referencia de Azkin **antes** de escribir código de
- **`IScheduler`** — `schedule(monitor)` / `unschedule(monitorId)`. Implementación in-memory con
  `Map<monitorId, NodeJS.Timeout>` y `setTimeout` recursivo (patrón `safeBeat`: evita solapamiento
  de checks), envuelto en `p-limit(N)` para no saturar red/CPU.

- **`IRealtimePublisher`** — `publishHeartbeat(ownerId, beat)`. La implementación Socket.io emite
  el evento `"heartbeat"` a la room del Admin propietario (`io.to(ownerId)`). Admin y Viewers se
  unen a esa room al conectar; los Viewers filtran en cliente por permisos. Contrato completo en
  [`04-contratos-api.md`](04-contratos-api.md) §13. Canal **unidireccional de solo lectura**.

- **`INotifier`** — `sendAlert(notification, monitor, from, to, beat): Promise<void>`.
  Servicio que implementa un **Strategy Pattern** para disparar alertas concurrentes a través de múltiples canales activos (`EmailNotifier`, `SlackNotifier`, `TelegramNotifier`, `DiscordNotifier`, `WebhookNotifier`) según los `notificationIds` configurados en el monitor. El motor ejecuta los envíos de forma asíncrona y no bloqueante.
  Cada canal de notificación implementa la interfaz **`INotificationStrategy`**:
  ```ts
  interface INotificationStrategy {
    readonly type: NotificationType;
    send(config: Record<string, any>, monitor: IMonitor, from: MonitorStatus, to: MonitorStatus, beat: IHeartbeat): Promise<void>;
  }
  ```
  Esto permite que añadir un proveedor nuevo sea una clase aislada registrada en el `NotifierRegistry`, sin modificar el orquestador principal.

---

## 6. Flujos arquitectónicos

### 6.1 Mutación de recursos (REST)
```
Cliente Angular ──HTTP──▶ Express Controller ──▶ Use Case ──▶ Repository (Mongoose)
                              │                      │
                       (Zod valida)         (scoped por userId)
```

### 6.2 Ejecución de un check (motor de monitoreo)
```
InMemoryScheduler (setTimeout) ──▶ ExecuteCheckUseCase
        │                                │
   p-limit(N)                    CheckerRegistry.resolve(type).check()
                                         │
                           persiste Heartbeat (Time Series)
                                         │
                           IRealtimePublisher.publishHeartbeat(monitor.userId, beat)
                                         │
                           ¿cambió UP↔DOWN? ──▶ INotifier (Multicanal en paralelo)
```

### 6.3 Tiempo real (solo lectura)

Contrato unificado — ver [`04-contratos-api.md`](04-contratos-api.md) §13.

```
Backend ──io.to(ownerId).emit("heartbeat", payload)──▶ SocketService (Angular)
              │                                              │
         ownerId = monitor.userId              Admin: actualiza todos sus monitores
         (Admin propietario)                   Viewer: filtra por permissions → signal<>
                                                            │
                                            MonitorStateService actualiza signal<>
```

---

## 7. Estrategia de testing (pirámide)

| Nivel | Alcance | Herramienta |
|---|---|---|
| Unit (base) | Dominio + casos de uso (puertos mockeados, sin I/O) | Jest / Vitest |
| Integración | Repositorios Mongoose contra Mongo efímero | `mongodb-memory-server` |
| E2E API | Endpoints REST completos | Supertest |
| E2E UI | Flujos de usuario en Angular | Playwright |

El dominio y los casos de uso se testean sin levantar infraestructura: ese es el beneficio
directo de la regla de dependencia.

---

## 8. Despliegue (Docker Compose)

Tres servicios en `compose.yaml` estructurados para máxima **robustez y resiliencia**:

- **`mongodb`** — persistencia; se inicializa la colección `Heartbeat` como Time Series. Incluye un `healthcheck` que verifica la disponibilidad antes de permitir que otros servicios interactúen con él.
- **`backend`** — imagen Node multi-stage (build TS → runtime slim) con política `restart: unless-stopped` y límites de memoria/CPU. Utiliza un mecanismo de espera inteligente (`depends_on` con condición `service_healthy`) y reintentos automáticos en la conexión de Mongoose para asegurar que el servicio no falle si la base de datos tarda en iniciar.
- **`frontend`** — build de Angular servido por nginx con políticas de reinicio automático y reconexión automática en el cliente de Socket.io ante caídas del servidor.

---

## 9. Trazabilidad de fases (SDD)

| Fase | Entregable | Estado |
|---|---|---|
| 1 — Arquitectura y stack | Este documento | ✅ Aprobada |
| 2 — Modelado de datos (Mongoose) | Interfaces + Schemas + Time Series | ⏳ Pendiente |
| 3 — Contratos de API REST | [`04-contratos-api.md`](04-contratos-api.md) | ✅ Aprobada |
| 4 — UI/UX y frontend | [`06-ui-ux.md`](06-ui-ux.md) | ✅ Aprobada |
| 5 — Motor de monitoreo | [`05-motor-monitoreo.md`](05-motor-monitoreo.md) | ✅ Aprobada |
