# Manual de Instalación con Docker

Azkin está pensado para desplegarse completamente vía Docker Compose: no requiere instalar
Node.js, pnpm ni MongoDB en el host. Este documento cubre la instalación paso a paso, tanto para
producción como para desarrollo con hot-reload, además de las tareas operativas más comunes
(actualizar, respaldar datos, servir HTTPS) y problemas frecuentes.

---

## 1. Requisitos previos

- **Docker Engine** con el plugin **Docker Compose v2** (comando `docker compose`, sin guion).
  Verifica con:
  ```bash
  docker --version
  docker compose version
  ```
- Puerto libre en el host: `80` (frontend) — es el único punto de entrada público por defecto
  (AZ-055). El backend no publica ningún puerto salvo que lo habilites explícitamente para
  depuración (ver [§12](#12-requisitos-de-red-puertos-y-protocolos)); MongoDB publica un puerto
  (`27017` por defecto) solo en la interfaz `127.0.0.1` — no compite con otros servicios
  accesibles desde la red, solo con otro Mongo local en el mismo puerto (ver §4). Todos son
  configurables — ver [§3](#3-configurar-las-variables-de-entorno).
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
| `AZKIN_MONGO_USER` / `AZKIN_MONGO_PASSWORD` | Credenciales root de MongoDB. El compose construye `AZKIN_MONGO_URI` automáticamente a partir de estas dos — no se define a mano en `.env`. La URI se arma por interpolación directa de texto (sin URL-encoding), así que una contraseña con caracteres especiales (`@ : / % ? #`) rompe el parseo de forma silenciosa; genera una solo alfanumérica con `openssl rand -hex 24`. | credenciales de ejemplo — **cámbialas** |
| `AZKIN_JWT_SECRET` | Firma los tokens de sesión. | placeholder — **obligatorio cambiar** |
| `AZKIN_FIRST_ADMIN_NAME` / `_EMAIL` / `_PASSWORD` | Cuenta Admin creada automáticamente al primer arranque (seeder), si no existe ningún Admin aún. | credenciales de ejemplo — **cámbialas** |
| `AZKIN_TLS_ENCRYPTION_KEY` | Cifra en reposo el secreto compartido de federación de instancias (AZ-049). Opcional: vacío = se deriva automáticamente de `AZKIN_JWT_SECRET`, sin configurar nada. Fijarla solo si querés una clave independiente. | vacío (se deriva sola) |
| `AZKIN_CORS_ORIGIN` | Orígenes permitidos para HTTP/Socket.io. `*` es válido en desarrollo, pero como decisión consciente. | `*` |
| `AZKIN_FRONTEND_PORT` | Puerto público publicado en el host — el único por defecto (ver [§12](#12-requisitos-de-red-puertos-y-protocolos)). Cambialo si ya usas `80`. | `80` |
| `AZKIN_BACK_PORT` | Solo tiene efecto si descomentás el bloque `ports:` del backend en `compose.yaml` (depuración directa, sin pasar por nginx). | `3000` |
| `AZKIN_MONGO_PORT` | Puerto de MongoDB en el host, solo para depuración/administración directa (Compass, mongosh, migraciones). Enlazado únicamente a `127.0.0.1` — no queda alcanzable desde la red externa (ver §4). El backend nunca usa esta variable, siempre se conecta internamente vía `azkin-db:27017`. | `27017` |
| `AZKIN_PROMETHEUS_USER` / `_PASS` / `_API_KEY` | Credenciales para `/metrics`. Sin ninguna configurada, el endpoint queda **inaccesible** (fail-closed) — no hay credenciales por defecto. | vacío |

> El primer Admin solo se crea si la colección de usuarios está vacía. Si ya existe al menos un
> Admin, `AZKIN_FIRST_ADMIN_*` se ignora — gestiona cuentas adicionales desde `/settings` una vez
> dentro (ver [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) §8).

---

## 4. Producción

Levanta el stack completo (frontend servido por Nginx en el puerto `80`, API en `3000`). Los tres
servicios comparten la red bridge dedicada `azkin-network`; el backend siempre se conecta a
MongoDB internamente vía `azkin-db:27017`, nunca a través de un puerto de host. MongoDB también
publica un puerto en el host (`AZKIN_MONGO_PORT`, `27017` por defecto) solo para depuración
directa, pero **enlazado exclusivamente a `127.0.0.1`** — no es alcanzable desde la red, solo
desde el propio servidor, y su número es configurable para no chocar con otro Mongo local en el
mismo puerto:

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
# -> {"status":"ok","version":"1.2.6"}

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
docker compose logs -f backend    # o frontend / azkin-db
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

- Backend: `http://localhost:3000` (o `AZKIN_BACK_PORT`).
- Frontend: `http://localhost:4200` (o `AZKIN_FRONTEND_PORT`, que en este compose por defecto es
  `4200`, no `80` como en producción).
- MongoDB: igual que en producción, publicada solo en `127.0.0.1:27017` (o `AZKIN_MONGO_PORT`) —
  conéctate con Compass/`mongosh` apuntando a `localhost` desde el propio equipo, o entra al
  contenedor directamente:

  ```bash
  docker compose -f compose.dev.yaml exec azkin-db mongosh -u "$AZKIN_MONGO_USER" -p
  ```

  Usa un volumen con nombre (`mongo-dev-data`), separado del bind mount de producción, así que
  los datos de dev y prod nunca se mezclan.
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

## 6. HTTPS (terminado en nginx)

Azkin **no** sirve HTTPS él mismo — el backend eliminó su listener HTTPS nativo (antes
configurable desde `/settings`) porque publicarlo directo al host reabría el mismo riesgo que
[AZ-055](../ISSUES.md) ya cerró para el puerto plano (evadir el rate limiter falsificando
`X-Forwarded-For`), y en Docker Desktop (Windows/Mac, no Linux nativo) no hay forma de exponer ese
puerto sin publicarlo explícitamente a todas las interfaces. La forma soportada de servir HTTPS es
terminarlo en `nginx` (el contenedor `frontend`), delante de todo — igual que ya hace con el
puerto 80.

Esto es opcional: si no lo necesitás, no hace falta tocar nada (el stack funciona igual de bien
por HTTP plano en el puerto `80`, protegido por el resto de tu infraestructura de red).

**Para activarlo:**

1. Conseguí tu certificado (`fullchain.pem` o `.crt`) y tu clave privada (`privkey.pem` o `.key`)
   — de una CA real (Let's Encrypt, tu CA interna) o autofirmado para pruebas. Guardalos en una
   carpeta del servidor que **no** sea la del repo, ej. `/etc/azkin/certs/`.
2. Montá esa carpeta como volumen de solo lectura en el servicio `frontend` de tu copia local de
   `compose.yaml`:
   ```yaml
     frontend:
       # ...
       volumes:
         - /etc/azkin/certs:/etc/nginx/certs:ro
       ports:
         - "${AZKIN_FRONTEND_PORT:-80}:80"
         - "443:443"
   ```
3. Agregá un `server {}` para 443 en `frontend/nginx.conf` (podés duplicar el bloque existente y
   ajustarlo), por ejemplo:
   ```nginx
   server {
       listen 443 ssl;
       server_name _;
       ssl_certificate     /etc/nginx/certs/fullchain.pem;
       ssl_certificate_key /etc/nginx/certs/privkey.pem;

       root /usr/share/nginx/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
       location /api/ {
           proxy_pass         http://backend:3000;
           proxy_http_version 1.1;
           proxy_set_header   Host              $host;
           proxy_set_header   X-Real-IP         $remote_addr;
           proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
           proxy_set_header   X-Forwarded-Proto $scheme;
       }
       location /socket.io/ {
           proxy_pass         http://backend:3000;
           proxy_http_version 1.1;
           proxy_set_header   Upgrade    $http_upgrade;
           proxy_set_header   Connection "upgrade";
           proxy_set_header   Host       $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   (opcional: agregá un `server { listen 80; return 301 https://$host$request_uri; }` para forzar
   HTTPS, en vez del bloque HTTP existente).
4. Reconstruí y recreá solo el frontend: `docker compose build frontend && docker compose up -d frontend`.

El backend no necesita ningún cambio — sigue sin publicar ningún puerto propio (§1/§12), nginx es
quien termina TLS y le habla por HTTP interno dentro de `azkin-network`, como ya hace hoy.

---

## 7. Actualizar a una nueva versión

```bash
git pull
docker compose build --no-cache && docker compose up -d   # o -f compose.dev.yaml en desarrollo
```

La versión desplegada se toma de `backend/package.json` en tiempo de ejecución (expuesta en
`/health` y en el login) — no hay ninguna variable de entorno que fijar al actualizar. Revisa
[`CHANGELOG.md`](../CHANGELOG.md) antes de saltar de versión: ahí se anotan cambios que requieran
una acción manual (por ejemplo, variables de `.env` renombradas o eliminadas).

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

> **⚠️ Un backup completo es una bóveda de credenciales (AZ-060).** El JSON generado por
> "Respaldo completo" incluye el `passwordHash` de **todos** los Admins y Viewers de la instancia,
> la clave privada TLS (cifrada en reposo, pero exportada igual) y los secretos de canales de
> notificación (`webhookUrl`/`botToken`/`smtpPassword`) **en texto plano** — a diferencia de la API
> normal, que siempre los enmascara. Cualquier cuenta Admin puede generar y descargar cualquier
> backup, sin aislamiento entre Admins (mismo modelo que ya aplica al pool de monitores, ver
> `spec/03-modelo-datos.md` §8). Tratá el archivo descargado con el mismo cuidado que el acceso
> directo a Mongo o al `.env`: no lo subas a un repositorio, un chat, o un storage compartido sin
> cifrar.

---

## 9. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `port is already allocated` al hacer `up` | Otro proceso usa `80`/`27017` en el host, o descomentaste el puerto opcional del backend (`3000`) y choca con otra cosa | Cambia `AZKIN_FRONTEND_PORT`/`AZKIN_MONGO_PORT` en `.env` (el `ports:` del backend en `compose.yaml` está comentado por defecto desde AZ-055 — ver fila de abajo, así que por defecto no reserva ningún puerto del host) |
| No puedo conectar MongoDB Compass / otro cliente externo desde **otra máquina** de la red | Es el comportamiento esperado: el puerto de Mongo está enlazado a `127.0.0.1`, solo accesible desde el propio servidor, por diseño de seguridad | Conéctate por SSH tunnel (`ssh -L 27017:127.0.0.1:27017 usuario@servidor`) o ejecuta el cliente directamente en el servidor. Si de verdad necesitas exponerlo a la red, cambia `127.0.0.1:${AZKIN_MONGO_PORT:-27017}:27017` a `${AZKIN_MONGO_PORT:-27017}:27017` en tu copia local del compose, asumiendo el riesgo |
| No puedo llegar al backend en `AZKIN_BACK_PORT` (3000 plano) ni desde el propio servidor ni desde otra máquina | Es el comportamiento esperado desde AZ-055: en producción (`compose.yaml`) ese puerto específico **no se publica por defecto** — `azkin-db`, `azkin-back` y `azkin-front` se hablan entre sí por nombre de servicio dentro de `azkin-network` (nginx → `http://backend:3000`), y eso nunca requiere publicar nada al host. Si tu único punto de entrada real es el frontend, no hay nada que arreglar. | Si de verdad necesitás llegar al backend plano sin pasar por nginx (depuración directa, un scraper de Prometheus externo), descomentá esa línea de `ports:` del servicio `backend` en tu copia local de `compose.yaml` — queda enlazada a `127.0.0.1` (no a todas las interfaces), para no abrir una vía de evadir el rate limiter con `X-Forwarded-For` falsificado |
| El backend no conecta a Mongo (`MongoServerError: Authentication failed`) | Cambiaste `AZKIN_MONGO_USER`/`AZKIN_MONGO_PASSWORD` en `.env` después de que el volumen/bind mount de Mongo ya se había inicializado con las credenciales anteriores | MongoDB solo aplica `MONGO_INITDB_ROOT_*` la **primera vez** que se crea el volumen de datos; si cambias credenciales después, borra `./data/mongodb` (prod) o el volumen `mongo-dev-data` (dev) y vuelve a levantar — perderás los datos existentes |
| No aparece ningún Admin para iniciar sesión | `AZKIN_FIRST_ADMIN_*` se definió después de que la colección de usuarios ya tenía datos (el seeder no se re-ejecuta) | Crea el primer Admin manualmente o restaura desde un respaldo; el auto-bootstrap solo corre una vez, con la base vacía |
| `/metrics` responde 401/403 siempre | No configuraste ni Basic Auth (`AZKIN_PROMETHEUS_USER`+`_PASS`) ni `AZKIN_PROMETHEUS_API_KEY` | Es el comportamiento esperado (fail-closed, sin credenciales por defecto desde AZ-010) — define al menos uno de los dos esquemas |
| CORS bloqueado en el navegador | `AZKIN_CORS_ORIGIN` no incluye el origen real del frontend | Debe ser un valor explícito (o `*` en desarrollo); reinicia el backend tras cambiarlo |
| El frontend en dev (`compose.dev.yaml`) no llega a la API | El dev-server de Angular no incluye el proxy de Nginx que sí existe en el build de producción | Ver [`frontend/README.md`](../frontend/README.md#desarrollo) |
| Un monitor marca **caído** un servicio que corre en el mismo servidor que Azkin, aunque respondes bien con `curl` desde el host | El contenedor `azkin-back` no siempre puede alcanzar la IP LAN del servidor (depende del firewall/red del host) | Nada que hacer manualmente en el monitor — Azkin lo detecta y reintenta solo, ver [§10](#10-monitorear-servicios-en-el-mismo-servidor). Si sigue marcando caído, es el firewall del host, no Azkin (mismo §10) |
| Un monitor con un **dominio interno corporativo** como target marca caído con mensaje `getaddrinfo ENOTFOUND <dominio>` / `queryA ENOTFOUND`, aunque el dominio carga bien en tu navegador | El servidor Docker (no el contenedor) no tiene ruta al DNS interno que resuelve ese dominio — ver [§11](#11-resolución-de-dominios-internos-dns-corporativo) | Configurar el DNS interno correcto en `compose.yaml` (§11) |

---

## 10. Monitorear servicios en el mismo servidor

Un monitor cuyo target sea un servicio que corre en la **misma máquina física** que Azkin (otro
contenedor suelto, otro `docker compose`, o un proceso nativo fuera de Docker) puede fallar al
usar la IP LAN del servidor como target (ej. `https://10.0.100.13:4300`) — un contenedor no
siempre puede alcanzar la IP del host que lo aloja, dependiendo del firewall/red configurados ahí.
El síntoma típico: el monitor se ve `CAÍDO` en Azkin, pero `curl` desde el propio servidor
responde bien.

**Esto ya se resuelve automáticamente, sin configurar nada en el monitor.** Los checkers HTTP,
Puerto TCP y Ping detectan este caso puntual (IP privada del target + error de conexión, no una
respuesta real del servicio) y reintentan una sola vez contra el hostname portable
`host.docker.internal` (`extra_hosts: host.docker.internal:host-gateway` en `compose.yaml` /
`compose.dev.yaml`, que Docker resuelve a la IP del host desde dentro del contenedor) **antes** de
declarar el monitor caído — quien configura el monitor solo pone la IP/dominio real del servicio,
igual que con cualquier otro target. Si el fallback tuvo que usarse, el estado del monitor lo dice
explícitamente en su mensaje (ej. `200 OK (vía host.docker.internal: ... no alcanzable
directamente desde el contenedor)`), para que quede claro en una auditoría por qué está "arriba".

Este fallback es deliberadamente conservador para no enmascarar caídas reales de servicios que sí
son remotos: solo se activa para IPs **privadas** (rangos `10.0.0.0/8`, `172.16.0.0/12`,
`192.168.0.0/16`, `127.0.0.0/8`) — nunca para un dominio público — y solo ante errores de
**conexión** (`ECONNREFUSED`/`ETIMEDOUT`/`ENETUNREACH`/`EHOSTUNREACH`), nunca ante una respuesta
HTTP real del servidor (un 404 o 500 reales nunca disparan el fallback).

**Si el target es un dominio/hostname** (no una IP privada literal) que resuelve al propio
servidor — ej. `https://mi-servicio-interno.miempresa.com:4300` — la detección automática no
puede inferir por sí sola que es "el mismo servidor". Para ese caso, al crear o editar el monitor
(tipo HTTP, Ping o Puerto TCP) marca el checkbox **"Este objetivo vive en el mismo servidor que
Azkin"**: aparece una leyenda explicando qué hace, y el fallback a `host.docker.internal` se activa
igual que con una IP privada, sin importar qué resuelva ese dominio.

**Si aun así el monitor sigue caído:** significa que el firewall del host bloquea también el
tráfico desde la subred de Docker hacia ese puerto por la ruta del gateway (común en servidores
endurecidos que solo permiten tráfico desde subredes específicas — por ejemplo, si otro stack en
el mismo servidor necesitó fijar su propia subred con `networks.<red>.ipam.config.subnet` para que
el firewall lo dejara pasar). En ese caso la solución es del firewall del servidor, no de Azkin:
agrega una regla que permita tráfico entrante desde la subred de `azkin-network` hacia el puerto
del servicio objetivo. Para ver esa subred:

```bash
docker network inspect azkin_azkin-network --format '{{(index .IPAM.Config 0).Subnet}}'
```

---

## 11. Resolución de dominios internos (DNS corporativo)

**Síntoma:** un monitor HTTP/Ping/Puerto cuyo target es un **dominio interno corporativo** (ej.
`wiki.miempresa.corp`, `certvault.miempresa.corp`) marca **caído** en Azkin, pero el dominio carga
perfectamente en tu navegador. El mensaje de la revisión (columna "Mensaje" en el detalle del
monitor, o el heartbeat en el log) dice algo como:

```text
getaddrinfo ENOTFOUND wiki.miempresa.corp
```

o, si lo revisas directo en el contenedor:

```text
Error: queryA ENOTFOUND wiki.miempresa.corp
```

**Esto es un problema de DNS, no de red ni de firewall** — y es distinto del caso del [§10](#10-monitorear-servicios-en-el-mismo-servidor):
el fallback automático a `host.docker.internal` (incluido el checkbox "Este objetivo vive en el
mismo servidor que Azkin") **solo se activa ante errores de conexión** (`ECONNREFUSED`/`ETIMEDOUT`/
`ENETUNREACH`/`EHOSTUNREACH`), nunca ante un fallo de resolución de nombre (`ENOTFOUND`). Marcar ese
checkbox no soluciona este caso.

**Causa típica:** tu PC/navegador resuelve `*.miempresa.corp` porque está en la red corporativa (o
conectado por VPN) y usa el DNS interno de la empresa. El **servidor Linux donde corre Docker**
puede tener una configuración de DNS distinta — a veces prefiere un DNS público (`8.8.8.8`) sobre
el interno, o directamente no tiene el DNS interno configurado — y ese DNS público, lógicamente, no
conoce dominios internos de tu empresa.

### Diagnóstico

1. **Lo más rápido** — revisa el mensaje de la última revisión del monitor en el propio dashboard
   de Azkin (ver arriba): si dice `ENOTFOUND`, ya confirmaste que es DNS sin tocar la terminal.
2. Confírmalo dentro del contenedor:
   ```bash
   docker exec -it azkin-back sh
   nslookup wiki.miempresa.corp
   ```
   Si responde `NXDOMAIN`, el contenedor no puede resolver el dominio con el DNS que está usando.
3. Confirma que **el host** (no el contenedor) tampoco lo resuelve con su DNS por defecto:
   ```bash
   resolvectl status          # systemd-resolved: qué servidores DNS usa cada interfaz de red
   resolvectl query wiki.miempresa.corp
   ```
   `resolvectl status` lista, por interfaz de red, los servidores DNS configurados (ej. `Current
   DNS Server: 8.8.8.8` / `DNS Servers: 192.168.50.10 8.8.8.8`). Si hay una IP privada en esa lista
   que no es la que está "current", es la candidata a ser el DNS interno real.
4. Prueba esa IP privada directamente:
   ```bash
   nslookup wiki.miempresa.corp 192.168.50.10
   ```
   Si ahí **sí** resuelve (te devuelve una IP interna, ej. `10.20.30.40`), encontraste el DNS
   interno correcto y confirmaste la causa raíz.

### Solución

Configura ese DNS interno directamente en el servicio `backend` de `compose.yaml` (y
`compose.dev.yaml` si usas ese flujo), con el DNS público como segunda opción para que los
monitores con targets públicos sigan resolviendo normalmente:

```yaml
services:
  backend:
    # ...resto de la configuración existente...
    dns:
      - 192.168.50.10   # DNS interno corporativo (el que confirmaste en el paso 4)
      - 8.8.8.8          # fallback público, para targets que no son internos
```

Aplica el cambio con:

```bash
docker compose up -d backend
```

Esto le dice al proxy DNS embebido de Docker (dentro del contenedor) que use directamente esos
servidores, sin depender de cómo esté configurado el DNS del host — el contenedor vuelve a resolver
dominios internos igual que tu navegador.

---

## 12. Requisitos de red (puertos y protocolos)

Lista pensada para pedirle al área de Redes exactamente lo que hay que abrir — separada en lo que
debe llegar **hacia** el servidor donde corre Azkin (entrada) y lo que Azkin necesita poder alcanzar
**desde** ese servidor (salida) para que el motor de monitoreo y las notificaciones funcionen.

### Entrada (hacia el servidor Azkin)

| Puerto | Protocolo | Variable | ¿Quién lo necesita? |
|---|---|---|---|
| 80 (o el que definas) | TCP (HTTP) | `AZKIN_FRONTEND_PORT` | **Obligatorio.** Es el único puerto que necesita cualquier usuario con navegador — Nginx sirve la SPA y hace de proxy interno hacia el backend para `/api/*` y `/socket.io/*` (WebSockets), así que todo el tráfico de usuario normal (UI, API, tiempo real) entra por acá. Si federas esta instancia con otras (ver `ISSUES.md`, AZ-049), el sondeo entre pares también entra por este mismo puerto — no hay un puerto dedicado a federación. |
| 3000 (o el que definas) | TCP (HTTP) | `AZKIN_BACK_PORT` | **Ni siquiera publicado por defecto en producción (AZ-055).** El bloque `ports:` del servicio `backend` viene comentado en `compose.yaml` — `azkin-front`/`azkin-back`/`azkin-db` se hablan por nombre de servicio dentro de `azkin-network`, sin necesitar ningún puerto publicado al host. Solo descomentalo (queda enlazado a `127.0.0.1`, no a todas las interfaces) si necesitás llegar sin pasar por nginx — ej. un scraper de Prometheus externo. Exponerlo a todas las interfaces permite evadir el rate limiter anti fuerza-bruta falsificando `X-Forwarded-For`. |
| 443 (opcional) | TCP (HTTPS) | — | Solo si terminás HTTPS en nginx (ver [§6](#6-https-terminado-en-nginx)) — no es un puerto que Azkin publique por defecto, lo agregás vos en tu copia local de `compose.yaml` junto con el certificado. |
| 27017 (o el que definas) | TCP | `AZKIN_MONGO_PORT` | **No abrir hacia la red.** Está enlazado únicamente a `127.0.0.1` del propio servidor (ver §4) — solo para depurar con Compass/mongosh estando conectado directamente a esa máquina. El backend nunca lo usa: se conecta a Mongo por la red interna de Docker. |

### Salida (desde el servidor Azkin hacia internet/red interna)

El motor de monitoreo necesita alcanzar cada objetivo que le pidas vigilar, y cada canal de alerta
que configures. Qué protocolos/puertos exactos dependen de qué tipos de monitor y canales uses:

| Protocolo / Puerto | Para qué | Tipo de monitor / canal |
|---|---|---|
| TCP 80/443 (o el puerto propio de cada sitio) | HTTP(S) saliente hacia cada objetivo | Monitor **HTTP/HTTPS** |
| ICMP (echo request/reply) | Ping saliente | Monitor **Ping** |
| TCP o UDP (el puerto y protocolo que configures por monitor, `portProtocol`) | Conexión/datagrama saliente hacia el puerto vigilado (ej. 22 SSH, 3389 RDP, 445 SMB) | Monitor **Puerto (TCP/UDP)** |
| UDP/TCP 53 | Consultas DNS — al servidor configurado en el monitor (`dnsResolver`, obligatorio) | Monitor **DNS Resolver**, la Herramienta de Diagnóstico DNS del navbar, y resolución de nombres en general para el resto de los monitores |
| UDP 161 (o el puerto que configures, `snmpPort`) | Consultas SNMP v1/v2c/v3 | Monitor **SNMP** |
| TCP 587/465/25 (según cómo configures el canal) | Envío de correo SMTP saliente | Canal de notificación **Email**, y el **SMTP de Aplicación** (recuperación de contraseña, `/settings` → Sistema) |
| TCP 443 (HTTPS saliente) | Llamadas a la API del servicio | Canales **Slack**, **Discord**, **Telegram** y **Webhook genérico** (cada uno llama a su propia URL vía HTTPS — `hooks.slack.com`, `discord.com`, `api.telegram.org`, o el host que definas en un webhook) |
| El mismo puerto de entrada del par (80/443 u otro que hayan definido) | Sondeo periódico saliente hacia cada instancia federada | Ver `ISSUES.md`, AZ-049. El tráfico es bidireccional: cada instancia federada abre conexión hacia sus pares y también recibe la de ellos, hasta un máximo de 5 instancias federadas por decisión de alcance, no por límite técnico. No hay un puerto propio de federación: viaja por el mismo puerto que cada instancia ya usa para su API/frontend. |

Ninguno de los anteriores requiere que abras un puerto de **entrada** más allá de los ya listados
en la tabla de arriba — son conexiones que el backend inicia hacia afuera (o, en el caso de
federación, hacia el mismo puerto de entrada que el par ya tiene abierto); el firewall del
servidor no necesita reglas adicionales para esto.

**Requisito adicional si usas federación:** los relojes de las instancias federadas deben estar
razonablemente sincronizados (NTP) — el mecanismo de recuperación de historial tras un corte de
red depende de comparar timestamps en UTC entre instancias.

**Casos especiales ya documentados en detalle en este mismo archivo:**
- Si un monitor apunta a un servicio en el **mismo servidor físico** que Azkin y falla por
  inalcanzable pese a estar arriba, ver §10 (`host.docker.internal`) — es un problema de red
  interna del host/Docker, no del firewall perimetral.
- Si tus monitores apuntan a **dominios internos** que un DNS público no resuelve (ej. `*.corp`,
  `*.local`), ver §11 — hay que decirle al contenedor qué DNS interno usar.

## 13. Ver también

- [README raíz](../README.md) — resumen del proyecto y stack.
- [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) — arquitectura, autenticación, API pública, y §14
  (federación de instancias, ver `ISSUES.md` AZ-049).
- [`docs/api-publica.md`](./api-publica.md) — integración externa por API Key.
- [`backend/README.md`](../backend/README.md) — desarrollo del backend fuera de Docker.
- [`frontend/README.md`](../frontend/README.md) — desarrollo del frontend fuera de Docker.
