# <p align="center"><img src="../assets/logo.png" alt="Azkin Logo" width="150"/></p>

# <p align="center">Azkin — Backend</p>

Plataforma de monitoreo multiusuario. Node + Express + TypeScript estricto,
MongoDB/Mongoose, Socket.io, con **Clean Architecture**.

Implementa las specs [`spec/02..05`](../spec).

## Estructura (regla de dependencia hacia adentro)

```
src/
├── domain/          Entidades puras, value objects, errores (cero deps npm)
├── application/     Casos de uso + puertos (interfaces)
├── infrastructure/  Express, Mongoose, Socket.io, checkers, scheduler, seguridad
├── composition-root.ts   DI manual
└── main.ts               Ciclo de vida
```

## Desarrollo

```bash
cp .env.example .env        # ajusta AZKIN_JWT_SECRET
pnpm install
pnpm run dev                 # requiere MongoDB local (>= 5.0)
```

## Verificación

```bash
pnpm run typecheck           # tsc --noEmit
pnpm run build               # compila a dist/
```

## Docker

Desde la **raíz del repo**.

### Desarrollo local (hot-reload)

Usa `compose.dev.yaml` — monta el código y recarga con `tsx watch`; los cambios
en `backend/src` se aplican sin reconstruir la imagen:

```bash
docker compose -f compose.dev.yaml build --no-cache && docker compose -f compose.dev.yaml up
```

- Backend en `http://localhost:3000`. MongoDB vive en la red interna `azkin-network` como
  `azkin-db:27017` (así se conecta el backend) y además se publica en `127.0.0.1:27017` (o
  `AZKIN_MONGO_PORT`) solo para depuración local con Compass/`mongosh` desde el propio equipo.
- Smoke test: `curl http://localhost:3000/health` → `{"status":"ok"}`.
- Detener: `Ctrl+C` y `docker compose -f compose.dev.yaml down` (añade `-v` para
  borrar también los datos de Mongo).
- En Windows/macOS el hot-reload usa polling (`CHOKIDAR_USEPOLLING`), ya activado.

### Producción local

Usa el `compose.yaml` por defecto (imagen multi-stage optimizada):

```bash
docker compose build --no-cache && docker compose up -d   # levanta azkin-db + backend + frontend
```

### Prueba rápida de la API

```bash
# Registro (devuelve un JWT)
curl -sX POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"dev@azkin.local","password":"password123"}'

# Crear un monitor (usa el token del paso anterior)
curl -sX POST http://localhost:3000/api/v1/monitors \
  -H 'Content-Type: application/json' -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Google","type":"http","target":"https://google.com","interval":30}'
```

## API

Base: `/api/v1`. Ver contrato completo en [`spec/04-contratos-api.md`](../spec/04-contratos-api.md).

- `POST /auth/register` · `POST /auth/login` → JWT
- `GET|POST /monitors` · `PUT|DELETE /monitors/:id`
- `GET /stats/monitor/:id/history` · `GET /stats/tags` · `GET /stats/tags/:tagName/overview`

Todos los endpoints (salvo `/auth`) requieren `Authorization: Bearer <JWT>`.
Tiempo real: Socket.io autenticado por JWT, evento `heartbeat` por room de usuario.
