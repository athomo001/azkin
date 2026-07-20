# <p align="center"><img src="assets/logo-azkin.png" alt="Azkin Logo" width="220"/></p>

# <p align="center">Azkin</p>

<p align="center">
  <strong>Plataforma profesional de monitoreo  y servicios de red en tiempo real.</strong>
</p>

---

## 🚀 Descripción General

**Azkin** es una solución para el monitoreo de disponibilidad, integridad y rendimiento de servicios web y redes en tiempo real.

> 📚 **Explicacion Coloquial**
Esta wea está pensada para cachar al tiro el uptime de varias páginas, servicios y redes, ver cuándo algo se cae (downtime), cuánto se demora en responder (latency) y recibir alerts en tiempo real para reaccionar rápido sin andar adivinando qué wea pasó.
--

La plataforma soporta múltiples tipos de verificación:

- **HTTP/HTTPS:** Latencia, códigos de respuesta, validación de palabras clave (presencia/ausencia) y detección/bypass inteligente de **Cloudflare WAF**.
- **Ping (ICMP):** Comprobación de estado a nivel de capa de red.
- **TCP Port:** Monitoreo de puertos y sockets activos.
- **DNS Resolver:** Resolución de registros A, AAAA, CNAME, MX y TXT con servidores específicos.
- **Push Pasivo:** Agente pasivo (heartbeat remoto hacia Azkin).
- **SNMP (v1/v2c/v3):** Lectura avanzada de OIDs para equipos de red.
- **Uptime 24h:** Cálculo de disponibilidad porcentual por monitor y por grupo para seguimiento operativo.

Para conocer el diseño detallado de la arquitectura de Clean Architecture, el funcionamiento del bypass de Cloudflare WAF, la lógica del modo Nyan Cat y el modelado de datos, consulta la [Documentación de Arquitectura de Azkin](./docs/ARCHITECTURE.md).
Para integrar sistemas externos (Grafana, scripts, CI/CD) sin usar una sesión de usuario, consulta la [Documentación de la API Pública](./docs/api-publica.md).

> ⚠️ **Estado: Beta.** Azkin está en desarrollo activo. Las funcionalidades principales operan de forma estable en uso diario, pero todavía faltan por probar en profundidad: casos límite de los distintos tipos de monitor (SNMP, Push Pasivo, DNS), volúmenes altos de monitores concurrentes, y varios flujos de administración (Viewers, respaldos, TLS) bajo condiciones reales de producción. No existe aún un test runner de frontend automatizado (ver [ISSUES.md](./ISSUES.md), AZ-019). Repórtanos cualquier bug que encuentres.

---

## ✨ Funcionalidades destacadas

- **Multi-administrador sin aislamiento por tenant:** todos los Admins comparten el mismo pool de monitores, canales de notificación y respaldos; cualquier Admin puede editar, resetear la contraseña, bloquear o eliminar la cuenta de otro Admin desde `/settings` (con protección de auto-bloqueo/auto-eliminación).
- **Viewers con permisos granulares:** cuentas de solo lectura con acceso a "todo", a un grupo específico o a un monitor puntual; incluyen un modo de sesión extendida (TV/Kiosko) con token de 1 año y una UI de fuentes/espaciados ampliados para pantallas grandes.
- **API pública con API Keys:** integra Azkin con sistemas externos vía `X-API-Key` (scopes `read`/`write`), sin depender de una sesión de usuario. Ver [`docs/api-publica.md`](./docs/api-publica.md).
- **Importación masiva de monitores (CSV):** carga por arrastrar y soltar con reporte de errores por fila, sin descartar el resto del lote ante una fila inválida.
- **Historial de auditoría:** registro y consulta desde `/settings` de acciones administrativas sensibles (borrado masivo de monitores, cambios de TLS, recuperación de contraseña).
- **Notificaciones multicanal con plantillas:** email, Slack, Discord, Telegram y webhooks genéricos, con plantillas configurables por tipo de evento, cheatsheet de variables clickeable y selector de emojis.
- **Sesión segura:** el access token vive en memoria (nunca en `localStorage`); la sesión se renueva mediante una cookie `HttpOnly` de refresh, rotada en cada uso.

---

## 🛠️ Stack Tecnológico

- **Frontend:** Angular 21 (Signals, Components Standalone, ECharts, Tailwind CSS).
- **Backend:** Node.js (>= 24.13.0) + Express 5.x + TypeScript (Strict).
- **Base de Datos:** MongoDB 8.x + Mongoose (colecciones tipo Time-Series con TTL).
- **Infraestructura:** Docker & Docker Compose.
- **Gestor de Paquetes:** pnpm (>= 11.13.1).

---

## 📂 Estructura del Repositorio

- **[frontend](./frontend)**: Cliente SPA moderno en Angular 21 con panel de control en tiempo real, gráficas comparativas de latencia, heatmap de bloques de disponibilidad y administración premium de configuración.
- **[backend](./backend)**: Servidor API REST / WebSockets con motor de monitoreo concurrente mediante colas limitadas, máquina de reintentos y notificaciones multicanal.

---

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [docs/instalacion-docker.md](./docs/instalacion-docker.md) | Manual de instalación con Docker: variables de entorno, producción, desarrollo con hot-reload, HTTPS nativo, respaldos, problemas frecuentes. |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Clean Architecture, bypass de Cloudflare WAF, modo Nyan Cat, autenticación, API pública, auditoría. |
| [docs/api-publica.md](./docs/api-publica.md) | Autenticación por `X-API-Key`, endpoints disponibles, gestión de keys, ejemplos `curl`. |
| `spec/` (local, no versionado en git) | Especificaciones funcionales por fase (Spec-Driven Development): modelo de datos, contratos de API, arquitectura. |
| [CHANGELOG.md](./CHANGELOG.md) | Historial de versiones (Keep a Changelog + SemVer). |
| [ISSUES.md](./ISSUES.md) | Backlog de bugs, deuda técnica y hallazgos de auditoría, con su resolución documentada. |
| `.env.example` / `backend/.env.example` | Referencia completa de variables de entorno soportadas. |

---

## ⚡ Inicio Rápido (Docker)

La plataforma está completamente containerizada. Los nombres de los contenedores Docker están estandarizados como `azkin-front`, `azkin-back` y `azkin-db`, conectados entre sí por una red Docker dedicada (`azkin-network`); el backend siempre habla con MongoDB por esa red interna, nunca por un puerto de host. MongoDB también publica un puerto en el host solo para depuración directa (Compass, mongosh), pero enlazado a `127.0.0.1` y con número configurable (`AZKIN_MONGO_PORT`) para no chocar con otros proyectos del mismo servidor.

```bash
cp .env.example .env        # ajusta credenciales antes de levantar el entorno

# Producción: Web en :80, API en :3000 (MongoDB solo interno + 127.0.0.1:27017 para debug)
docker compose build --no-cache && docker compose up -d

# Desarrollo con hot-reload (Web en :4200)
docker compose -f compose.dev.yaml build --no-cache && docker compose -f compose.dev.yaml up -d
```

Guía completa (variables de entorno, verificación, HTTPS nativo, respaldos, problemas frecuentes) en [`docs/instalacion-docker.md`](./docs/instalacion-docker.md).

---

## 🛡️ Seguridad y Auditoría

Este espacio está configurado bajo estándares de seguridad estrictos y es utilizado exclusivamente para monitoreo autorizado y auditorías de seguridad perimetral y disponibilidad de red.

_Diseñado bajo principios de Clean Architecture y Spec-Driven Development._

---

## 🏷️ Versiones y Tags

Azkin sigue **Versionado Semántico** y publica versiones en `CHANGELOG.md`.
La convención de tags recomendada en Git es:

- `vMAJOR.MINOR.PATCH` (ejemplo: `v1.0.0`)

Comandos útiles para ver versiones por tag:

```bash
# listar tags
git tag

# listar tags con su mensaje/anotación
git tag -n

# ver detalle de una versión específica
git show v1.0.0

# comparar dos versiones
git diff v1.0.0..v1.1.0
```

Relación recomendada entre artefactos:

- Cada release en `CHANGELOG.md` debe tener su tag Git correspondiente.
- Si se publican imágenes Docker, usar el mismo tag de versión (por ejemplo `v1.0.0`) para mantener trazabilidad.
