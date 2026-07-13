# Azkin — Backend

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
npm install
npm run dev                 # requiere MongoDB local (>= 5.0)
```

## Verificación

```bash
npm run typecheck           # tsc --noEmit
npm run build               # compila a dist/
```

## Docker

Desde la raíz del repo:

```bash
docker compose up --build   # levanta mongodb + backend
```

## API

Base: `/api/v1`. Ver contrato completo en [`spec/04-contratos-api.md`](../spec/04-contratos-api.md).

- `POST /auth/register` · `POST /auth/login` → JWT
- `GET|POST /monitors` · `PUT|DELETE /monitors/:id`
- `GET /stats/monitor/:id/history` · `GET /stats/tags` · `GET /stats/tags/:tagName/overview`

Todos los endpoints (salvo `/auth`) requieren `Authorization: Bearer <JWT>`.
Tiempo real: Socket.io autenticado por JWT, evento `heartbeat` por room de usuario.
