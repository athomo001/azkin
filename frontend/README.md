# <p align="center"><img src="../assets/logo.png" alt="Azkin Logo" width="150"/></p>

# <p align="center">Azkin — Frontend</p>

SPA en Angular 21 (Standalone Components, Signals) para el panel de monitoreo de Azkin.
Consume la API REST y los WebSockets del [backend](../backend) y no tiene estado propio
persistente: toda la fuente de verdad vive en MongoDB, servida vía `core/services`.

Implementa la spec [`spec/06-ui-ux.md`](../spec/06-ui-ux.md).

## Estructura

```
src/app/
├── core/            Servicios inyectables (auth, monitores, notificaciones, tema, i18n,
│                     confirm/toast), guards de ruta, interceptores HTTP, utilidades puras
├── features/
│   ├── auth/         Login, registro (deshabilitado tras el primer Admin), recuperación de clave
│   ├── dashboard/     Vista principal: KPIs, árbol de monitores, gráficas ECharts, alta/edición
│   ├── settings/       Panel Admin por pestañas: TLS, Auditoría, API Keys, Respaldos, Viewers, Alertas
│   └── profile/        Gestión de la propia cuenta (cualquier rol autenticado)
└── shared/components/  Componentes de presentación reutilizables (modales, toasts, badges, etc.)
```

`dashboard.ts` y `settings.ts` son orquestadores delgados que delegan a subcomponentes por
dominio — ver [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) §3 para el detalle de la
descomposición (AZ-016) y qué queda intencionalmente fuera (gráficos ECharts + panel de detalle
del dashboard).

## Desarrollo

Requiere el [backend](../backend) corriendo en paralelo (las llamadas HTTP usan la ruta relativa
`/api/v1`, resuelta por el proxy de Nginx en producción o por el mismo origen en Docker; para
`ng serve` local sin Docker, sirve el frontend detrás de un proxy propio hacia `localhost:3000` o
ajusta `MonitorService`/`AuthService` para apuntar a la URL absoluta del backend).

```bash
pnpm install
pnpm start          # ng serve, http://localhost:4200
```

## Verificación

```bash
pnpm run build       # ng build, compila a dist/
```

> ⚠️ **No hay test runner configurado** (`ng test` falla con "Cannot determine project or target
> for command" — no hay builder de test en `angular.json`, ni Karma ni Vitest instalados). Ver
> [ISSUES.md](../ISSUES.md) AZ-019. Las funciones puras del proyecto (`normalizeMonitorStatus`,
> `extractApiErrorMessage`, ambas en `core/utils`) ya están extraídas y listas para testear en
> cuanto exista un runner.

## Docker

Ver [README raíz](../README.md#-inicio-rápido-docker): `docker compose -f compose.dev.yaml build --no-cache && docker compose -f compose.dev.yaml up`
(hot-reload) o `docker compose build --no-cache && docker compose up -d` (producción, build multi-stage servido por Nginx —
ver [`nginx.conf`](./nginx.conf) para el proxy de `/api/` y `/socket.io/` hacia el backend).
