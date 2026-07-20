# Manual de Instalación con Docker

Azkin está pensado para desplegarse completamente vía Docker Compose: no requiere instalar
Node.js, pnpm ni MongoDB en el host. Este documento cubre la instalación paso a paso, tanto para
producción como para desarrollo con hot-reload, además de las tareas operativas más comunes
(actualizar, respaldar datos, activar HTTPS nativo) y problemas frecuentes.

---

## 1. Requisitos previos

- **Docker Engine** con el plugin **Docker Compose v2** (comando `docker compose`, sin guion).
  Verifica con:
  ```bash
  docker --version
  docker compose version
  ```
- Puertos libres en el host: `80` (frontend), `3000` (API backend), `27017` (MongoDB) y,
  opcionalmente, `8443` (HTTPS nativo del backend, ver [§6](#6-https-nativo-opcional)). Todos son
  configurables si están ocupados — ver [§3](#3-configurar-las-variables-de-entorno).
- No se necesita clonar `spec/` para levantar el sistema: es documentación funcional local, no
  código.

---

## 2. Clonar el repositorio

```bash
git clone <url-del-repositorio> azkin
cd azkin
```

---

## 3. Configurar las variables de entorno

Todo el stack (MongoDB, backend, frontend) lee un único `.env` en la **raíz** del repositorio,
que Docker Compose carga automáticamente.

```bash
cp .env.example .env
```

Variables que **debes revisar/cambiar** antes de levantar el entorno (ver [`.env.example`](../.env.example)
para el listado completo y comentado):

| Variable | Qué controla | Valor por defecto |
|---|---|---|
| `AZKIN_MONGO_USER` / `AZKIN_MONGO_PASSWORD` | Credenciales root de MongoDB. Deben coincidir con las embebidas en `AZKIN_MONGO_URI`. | credenciales de ejemplo — **cámbialas** |
| `AZKIN_JWT_SECRET` | Firma los tokens de sesión. | placeholder — **obligatorio cambiar** |
| `AZKIN_FIRST_ADMIN_NAME` / `_EMAIL` / `_PASSWORD` | Cuenta Admin creada automáticamente al primer arranque (seeder), si no existe ningún Admin aún. | credenciales de ejemplo — **cámbialas** |
| `AZKIN_TLS_ENCRYPTION_KEY` | Cifra en reposo la clave privada TLS si activas HTTPS nativo desde la UI. Vacío = HTTPS nativo deshabilitado. | vacío |
| `AZKIN_CORS_ORIGIN` | Orígenes permitidos para HTTP/Socket.io. `*` es válido en desarrollo, pero como decisión consciente. | `*` |
| `AZKIN_PORT` / `AZKIN_FRONTEND_PORT` / `AZKIN_HTTPS_PORT` | Puertos publicados en el host. Cambia estos valores si ya usas `80`/`3000`/`8443`. | `3000` / `80` / `8443` |
| `AZKIN_PROMETHEUS_USER` / `_PASS` / `_API_KEY` | Credenciales para `/metrics`. Sin ninguna configurada, el endpoint queda **inaccesible** (fail-closed) — no hay credenciales por defecto. | vacío |

> El primer Admin solo se crea si la colección de usuarios está vacía. Si ya existe al menos un
> Admin, `AZKIN_FIRST_ADMIN_*` se ignora — gestiona cuentas adicionales desde `/settings` una vez
> dentro (ver [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) §8).

---

## 4. Producción

Levanta el stack completo (frontend servido por Nginx en el puerto `80`, API en `3000`, MongoDB
en `27017`):

```bash
docker compose build --no-cache && docker compose up -d
```

> Las imágenes se construyen localmente desde los `Dockerfile` del repo — no se descargan de
> Docker Hub. `docker compose up -d` por sí solo **no reconstruye** si ya existe una imagen con
> ese nombre en el host, y `--build` puede reutilizar capas cacheadas de un build anterior.
> `build --no-cache` fuerza una reconstrucción completa a partir del código fuente actual.

Contenedores resultantes: `azkin-front`, `azkin-back`, `azkin-db` (nombres estáticos, no
generados por Compose).

**Verificar que arrancó correctamente:**

```bash
# Backend responde y expone la versión desplegada
curl http://localhost:3000/health
# -> {"status":"ok","version":"1.2.0"}

# Frontend (Nginx) sirve la SPA
curl -sI http://localhost/ | head -1
# -> HTTP/1.1 200 OK
```

Abre `http://localhost` (o el puerto que hayas puesto en `AZKIN_FRONTEND_PORT`) e inicia sesión
con `AZKIN_FIRST_ADMIN_EMAIL` / `AZKIN_FIRST_ADMIN_PASSWORD`.

**Persistencia de datos:** en producción, MongoDB usa un *bind mount* directo a
`./data/mongodb` en el host (no un volumen con nombre) — los datos sobreviven a
`docker compose down` e incluso a `docker compose down -v`, ya que no hay volumen que borrar.

**Logs:**

```bash
docker compose logs -f backend    # o frontend / mongodb
```

**Detener:**

```bash
docker compose down
```

---

## 5. Desarrollo local (hot-reload)

Usa el compose alternativo `compose.dev.yaml`, que monta el código fuente como volumen y recarga
automáticamente ante cambios (backend con `tsx watch`, frontend con `ng serve`):

```bash
docker compose -f compose.dev.yaml build --no-cache && docker compose -f compose.dev.yaml up
```

- Backend: `http://localhost:3000` (o `AZKIN_PORT`).
- Frontend: `http://localhost:4200` (o `AZKIN_FRONTEND_PORT`, que en este compose por defecto es
  `4200`, no `80` como en producción).
- MongoDB: `localhost:27017`, con un volumen con nombre (`mongo-dev-data`), separado del bind
  mount de producción — los datos de dev y prod nunca se mezclan.
- En Windows/macOS el hot-reload usa *polling* de archivos (`CHOKIDAR_USEPOLLING=true`), ya
  activado en el compose — necesario porque los bind mounts de Docker Desktop no siempre
  propagan eventos `inotify` nativos.

**Diferencia clave vs. producción:** en dev, el frontend corre con el dev-server de Angular
(`ng serve`) dentro del contenedor, no con el build de Nginx — por eso no hay proxy de `/api/`
integrado; ver [`frontend/README.md`](../frontend/README.md#desarrollo) para el detalle de cómo
acceder al backend desde el dev-server.

**Reiniciar node_modules del contenedor** (si cambiaste dependencias y el volumen quedó
desactualizado):

```bash
docker compose -f compose.dev.yaml down
docker volume rm azkin_frontend_node_modules   # el backend reinstala en cada build
docker compose -f compose.dev.yaml build --no-cache && docker compose -f compose.dev.yaml up
```

---

## 6. HTTPS nativo (opcional)

El backend puede servir HTTPS directamente (sin terminar TLS en un proxy externo), configurable
desde la UI de administración (`/settings` → pestaña **TLS**), no por variables de entorno de
certificado:

1. Define `AZKIN_TLS_ENCRYPTION_KEY` en `.env` **antes** de configurar TLS desde la UI —
   genera una con:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   (no necesitas Node en el host: puedes ejecutarlo dentro del contenedor con
   `docker compose exec backend node -e "..."`).
2. Levanta el stack normalmente; el puerto `AZKIN_HTTPS_PORT` (default `8443`) ya está publicado
   en ambos `compose.yaml`/`compose.dev.yaml` aunque el listener HTTPS esté inactivo.
3. Sube certificado, clave privada y (opcionalmente) cadena intermedia desde `/settings` → **TLS**
   — como texto PEM o como archivo. Ver [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) para el
   diseño de esta función.
4. El listener HTTPS se activa sin reiniciar el contenedor.

Si `AZKIN_TLS_ENCRYPTION_KEY` queda vacío, la pestaña TLS sigue visible pero la configuración no
puede cifrarse en reposo — el backend rechaza guardar certificados hasta que la variable esté
definida.

---

## 7. Actualizar a una nueva versión

```bash
git pull
docker compose build --no-cache && docker compose up -d   # o -f compose.dev.yaml en desarrollo
```

Actualiza también `AZKIN_VERSION` en `.env` si vas a fijar un tag específico (se propaga como
`LABEL org.opencontainers.image.version` en las imágenes y aparece en `/health` y en el login).
Revisa [`CHANGELOG.md`](../CHANGELOG.md) antes de saltar de versión — anota cambios que requieran
acción manual (ninguno documentado hasta la fecha, pero es el lugar donde se anunciarían).

---

## 8. Respaldo y restauración

Dos mecanismos, no confundir:

- **Respaldo a nivel de infraestructura (Mongo completo):** en producción, basta con copiar
  `./data/mongodb` con el stack detenido (`docker compose down` primero, para evitar copiar
  archivos en escritura).
- **Respaldo funcional (monitores/config, vía la app):** `/settings` → pestaña **Respaldos**
  genera/restaura backups JSON de monitores y configuración, e importa monitores masivamente vía
  CSV — ver [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) y el `CHANGELOG.md` (AZ-005, AZ-028). Este
  mecanismo no incluye heartbeats históricos (viven en una colección Time-Series con TTL de 30
  días por diseño).

---

## 9. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `port is already allocated` al hacer `up` | Otro proceso usa `80`/`3000`/`27017`/`8443` en el host | Cambia `AZKIN_FRONTEND_PORT`/`AZKIN_PORT`/`AZKIN_HTTPS_PORT` en `.env` (Mongo no es configurable por variable, cambia el mapeo en el compose si lo necesitas) |
| El backend no conecta a Mongo (`MongoServerError: Authentication failed`) | `AZKIN_MONGO_URI` no coincide con `AZKIN_MONGO_USER`/`AZKIN_MONGO_PASSWORD`, o cambiaste las credenciales sin borrar el volumen/bind mount ya inicializado | MongoDB solo aplica `MONGO_INITDB_ROOT_*` la **primera vez** que se crea el volumen de datos; si cambias credenciales después, borra `./data/mongodb` (prod) o el volumen `mongo-dev-data` (dev) y vuelve a levantar — perderás los datos existentes |
| No aparece ningún Admin para iniciar sesión | `AZKIN_FIRST_ADMIN_*` se definió después de que la colección de usuarios ya tenía datos (el seeder no se re-ejecuta) | Crea el primer Admin manualmente o restaura desde un respaldo; el auto-bootstrap solo corre una vez, con la base vacía |
| `/metrics` responde 401/403 siempre | No configuraste ni Basic Auth (`AZKIN_PROMETHEUS_USER`+`_PASS`) ni `AZKIN_PROMETHEUS_API_KEY` | Es el comportamiento esperado (fail-closed, sin credenciales por defecto desde AZ-010) — define al menos uno de los dos esquemas |
| CORS bloqueado en el navegador | `AZKIN_CORS_ORIGIN` no incluye el origen real del frontend | Debe ser un valor explícito (o `*` en desarrollo); reinicia el backend tras cambiarlo |
| El frontend en dev (`compose.dev.yaml`) no llega a la API | El dev-server de Angular no incluye el proxy de Nginx que sí existe en el build de producción | Ver [`frontend/README.md`](../frontend/README.md#desarrollo) |

---

## 10. Ver también

- [README raíz](../README.md) — resumen del proyecto y stack.
- [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) — arquitectura, autenticación, API pública.
- [`docs/api-publica.md`](./api-publica.md) — integración externa por API Key.
- [`backend/README.md`](../backend/README.md) — desarrollo del backend fuera de Docker.
- [`frontend/README.md`](../frontend/README.md) — desarrollo del frontend fuera de Docker.
