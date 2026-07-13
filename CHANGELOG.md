# Changelog

Todos los cambios notables de **Azkin** se documentan aquí.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added

- **Entorno de desarrollo local con Docker**: `backend/Dockerfile.dev` (hot-reload
  con `tsx watch`) y `compose.dev.yaml` (MongoDB + backend con el código montado
  como volumen). Instrucciones en `backend/README.md`.
- **Backend** (`backend/`) implementado con Clean Architecture (Node + Express +
  TypeScript estricto):
  - `domain`: entidades puras (`User`, `Monitor`, `Heartbeat`), value objects
    (`MonitorStatus`, `MonitorType`) y jerarquía de `DomainError`.
  - `application`: casos de uso (auth, monitores CRUD, stats, `ExecuteCheck` con
    máquina de reintentos) y puertos (repositorios y servicios).
  - `infrastructure`: repositorios Mongoose (`Heartbeat` como Time Series
    Collection con TTL de 30 días), API REST Express (`/api/v1`) con guard JWT,
    validación Zod y envelope de error único, checkers `http`/`ping`/`port`
    (Strategy + registry con `p-limit`), scheduler in-memory (`setTimeout`
    recursivo), gateway Socket.io por room de usuario, JWT/bcrypt y notifier seam.
  - Composition root con DI manual y ciclo de vida con apagado ordenado.
  - `Dockerfile` multi-stage (producción) y `compose.yaml` (MongoDB + backend).
- **Especificaciones SDD** (`spec/`):
  - Fase 1 — Arquitectura y stack (`02-arquitectura.md`).
  - Fase 2 — Modelado de datos MongoDB/Mongoose (`03-modelo-datos.md`).
  - Fase 3 — Contratos de la API REST (`04-contratos-api.md`).
  - Fase 5 — Motor de monitoreo (`05-motor-monitoreo.md`).
  - Análisis de ingeniería inversa de Uptime Kuma como referencia.

### Notes

- La verificación end-to-end del backend contra MongoDB está **pendiente**
  (validado hasta ahora: `tsc --noEmit` limpio y smoke test de cableado DI).
- La **Fase 4 (UI/UX y frontend Angular)** está aparcada por decisión del proyecto.

[Unreleased]: https://github.com/athomo001/azkin/compare/main...feature
