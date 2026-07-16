# <p align="center"><img src="assets/logo-azkin.png" alt="Azkin Logo" width="220"/></p>

# <p align="center">Azkin</p>

<p align="center">
  <strong>Plataforma profesional de monitoreo multiusuario de infraestructura y servicios de red en tiempo real.</strong>
</p>

---

## 🚀 Descripción General

**Azkin** es una solución para el monitoreo de disponibilidad, integridad y rendimiento de servicios web y redes en tiempo real.

La plataforma soporta múltiples tipos de verificación:

- **HTTP/HTTPS:** Latencia, códigos de respuesta, validación de palabras clave (presencia/ausencia) y detección/bypass inteligente de **Cloudflare WAF**.
- **Ping (ICMP):** Comprobación de estado a nivel de capa de red.
- **TCP Port:** Monitoreo de puertos y sockets activos.
- **DNS Resolver:** Resolución de registros A, AAAA, CNAME, MX y TXT con servidores específicos.
- **Push Pasivo:** Agente pasivo (heartbeat remoto hacia Azkin).
- **SNMP (v1/v2c/v3):** Lectura avanzada de OIDs para equipos de red.

Para conocer el diseño detallado de la arquitectura de Clean Architecture, el funcionamiento del bypass de Cloudflare WAF, la lógica del modo Nyan Cat y el modelado de datos, consulta la [Documentación de Arquitectura de Azkin](./docs/ARCHITECTURE.md).

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

## ⚡ Inicio Rápido (Docker)

La plataforma está completamente containerizada. Los nombres de los contenedores Docker están estandarizados como `azkin-front`, `azkin-back` y `azkin-db`.

### Producción

Para levantar el entorno completo de producción (Web en puerto `80`, API en puerto `3000`, MongoDB en `27017`):

```bash
docker compose up -d --build
```

### Desarrollo Local (con Hot-Reload)

Para desarrollo con recarga en caliente en frontend y backend:

```bash
docker compose -f compose.dev.yaml up -d --build
```

---

## 🛡️ Seguridad y Auditoría

Este espacio está configurado bajo estándares de seguridad estrictos y es utilizado exclusivamente para monitoreo autorizado y auditorías de seguridad perimetral y disponibilidad de red.

_Diseñado bajo principios de Clean Architecture y Spec-Driven Development._
