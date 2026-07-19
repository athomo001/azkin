# API Pública de Azkin (AZ-029)

La API pública permite integrar sistemas externos (dashboards, scripts, CI/CD) con Azkin sin usar
una sesión de usuario. Se autentica con una **API Key** en vez del JWT de sesión.

> **Licencia:** Azkin se distribuye bajo SSPL v1 con licencia comercial opcional para producción.
> Usar esta API para construir un servicio comercial de terceros (es decir, revender u ofrecer a
> tus propios clientes una funcionalidad cuyo valor derive de Azkin) está sujeto a la Sección 13
> de la SSPL v1 salvo que cuentes con una Licencia Comercial vigente. Ver la sección
> [10. Licencia y restricciones de uso](#10-licencia-y-restricciones-de-uso) y
> [`LICENSE.md`](../LICENSE.md). Toda respuesta de esta API incluye los headers `X-License` y
> `X-License-Notice` con este mismo recordatorio.

## 1. Generar una API Key

Desde `/settings` → pestaña **API** (solo Admins), genera una key indicando un nombre y si
necesita permiso de escritura además de lectura. La key en texto plano se muestra **una única
vez**: cópiala en ese momento, no se puede recuperar después (solo se persiste su hash).

## 2. Autenticación

Todas las peticiones a la API pública deben incluir el header:

```
X-API-Key: azk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

No se envía `Authorization: Bearer ...` — el header `X-API-Key` reemplaza por completo el flujo de
sesión para estas rutas.

### Scopes

Cada key tiene uno o ambos scopes:

- `read` — habilita `GET`.
- `write` — habilita `POST`, `PUT`, `PATCH`, `DELETE`.

Una key con solo `read` usada en un método de escritura responde `403 FORBIDDEN`.

## 3. Endpoints disponibles

Prefijo base: `/api/public/v1`

| Método | Ruta | Scope requerido | Descripción |
|---|---|---|---|
| `GET` | `/monitors` | `read` | Lista todos los monitores (pool global, sin aislamiento por tenant) |
| `POST` | `/monitors` | `write` | Crea un monitor |
| `PUT` | `/monitors/:id` | `write` | Actualiza un monitor |
| `DELETE` | `/monitors/:id` | `write` | Elimina un monitor |
| `POST` | `/monitors/bulk-delete` | `write` | Elimina varios monitores por `id` |
| `POST` | `/monitors/bulk-import` | `write` | Importación masiva vía CSV (ver `AZ-028`) |

El cuerpo de petición/respuesta de cada endpoint es idéntico al de la API de sesión
(`/api/v1/monitors`, ver `spec/04-contratos-api.md`) — la única diferencia es el mecanismo de
autenticación.

## 4. Formato de error

Mismo envelope que el resto de la API (`spec/04-contratos-api.md` §2):

```ts
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

Códigos específicos de la API pública:

| `code` | HTTP | Cuándo |
|---|---|---|
| `UNAUTHORIZED` | 401 | Falta el header `X-API-Key`, o la key es inválida/revocada |
| `FORBIDDEN` | 403 | La key no tiene el scope requerido para el método usado |

## 5. Gestión de keys (requiere sesión de Admin)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/v1/api-keys` | Crea una key. Body: `{ "name": string, "scopes": ("read"\|"write")[] }`. Devuelve `plainKey` una única vez. |
| `GET` | `/api/v1/api-keys` | Lista las keys del Admin (solo `keyPrefix`, nunca la key completa) |
| `DELETE` | `/api/v1/api-keys/:id` | Revoca una key inmediatamente |

## 6. Ejemplos con curl

**Listar monitores:**

```bash
curl -H "X-API-Key: azk_xxx..." https://tu-dominio.com/api/public/v1/monitors
```

**Crear un monitor:**

```bash
curl -X POST https://tu-dominio.com/api/public/v1/monitors \
  -H "X-API-Key: azk_xxx..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sitio principal",
    "type": "http",
    "target": "https://ejemplo.com",
    "interval": 60,
    "retries": 0,
    "retryInterval": 60
  }'
```

**Actualizar un monitor:**

```bash
curl -X PUT https://tu-dominio.com/api/public/v1/monitors/<id> \
  -H "X-API-Key: azk_xxx..." \
  -H "Content-Type: application/json" \
  -d '{ "interval": 30 }'
```

**Eliminar un monitor:**

```bash
curl -X DELETE https://tu-dominio.com/api/public/v1/monitors/<id> \
  -H "X-API-Key: azk_xxx..."
```

**Generar una API Key (con sesión de Admin ya autenticada):**

```bash
curl -X POST https://tu-dominio.com/api/v1/api-keys \
  -H "Authorization: Bearer <access-token-de-sesion>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Integración Grafana", "scopes": ["read"] }'
```

## 7. Colección de Postman

Importa `docs/postman/azkin-api-publica.postman_collection.json` (colección) y
`docs/postman/azkin-api-publica.postman_environment.json` (entorno) en Postman. Incluye las
peticiones de la sección 3 con cuerpos de ejemplo ya completados, más la gestión de keys de la
sección 5.

Antes de ejecutar, edita el entorno **Azkin — API Pública** y completa:

| Variable | Valor |
|---|---|
| `base_url` | URL de tu instancia, ej. `https://monitor.miempresa.com` |
| `api_key` | La key generada en `/settings` → pestaña **API** |
| `monitor_id` | El `id` de un monitor existente (para actualizar/eliminar) |
| `session_token` | Solo para la carpeta "Gestión de API Keys" — un access token de sesión de Admin |

## 8. Integración con n8n

`docs/n8n/azkin-listar-monitores.n8n-workflow.json` es un workflow importable
(**Workflows → Import from File**) que dispara cada 5 minutos con un nodo **Schedule Trigger** y
consulta `GET /api/public/v1/monitors` con un nodo **HTTP Request**, autenticando vía el header
`X-API-Key`.

Antes de activarlo, define en n8n (Settings → Environment variables, o `.env` si es self-hosted):

- `AZKIN_BASE_URL` — ej. `https://monitor.miempresa.com`
- `AZKIN_API_KEY` — una key con scope `read` generada en `/settings` → **API**

Para otras operaciones (crear/eliminar monitores, importar CSV), duplica el nodo **HTTP Request** y
cambia método/URL/body siguiendo la tabla de la sección 3 — el header `X-API-Key` se reutiliza tal
cual.

## 9. Snippets en JavaScript y Python

**Listar monitores:**

```javascript
const res = await fetch("https://tu-dominio.com/api/public/v1/monitors", {
  headers: { "X-API-Key": "azk_xxx..." },
});
if (!res.ok) throw new Error(`Azkin API error: ${res.status}`);
const monitors = await res.json();
```

```python
import requests

res = requests.get(
    "https://tu-dominio.com/api/public/v1/monitors",
    headers={"X-API-Key": "azk_xxx..."},
)
res.raise_for_status()
monitors = res.json()
```

**Crear un monitor:**

```javascript
const res = await fetch("https://tu-dominio.com/api/public/v1/monitors", {
  method: "POST",
  headers: {
    "X-API-Key": "azk_xxx...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Sitio principal",
    type: "http",
    target: "https://ejemplo.com",
    interval: 60,
    retries: 0,
    retryInterval: 60,
  }),
});
if (!res.ok) throw new Error(`Azkin API error: ${res.status}`);
const monitor = await res.json();
```

```python
import requests

res = requests.post(
    "https://tu-dominio.com/api/public/v1/monitors",
    headers={"X-API-Key": "azk_xxx..."},
    json={
        "name": "Sitio principal",
        "type": "http",
        "target": "https://ejemplo.com",
        "interval": 60,
        "retries": 0,
        "retryInterval": 60,
    },
)
res.raise_for_status()
monitor = res.json()
```

**Eliminar un monitor:**

```javascript
const res = await fetch(`https://tu-dominio.com/api/public/v1/monitors/${monitorId}`, {
  method: "DELETE",
  headers: { "X-API-Key": "azk_xxx..." },
});
if (!res.ok) throw new Error(`Azkin API error: ${res.status}`);
```

```python
import requests

res = requests.delete(
    f"https://tu-dominio.com/api/public/v1/monitors/{monitor_id}",
    headers={"X-API-Key": "azk_xxx..."},
)
res.raise_for_status()
```

## 10. Licencia y restricciones de uso

Azkin se distribuye bajo un esquema de licenciamiento dual — ver [`LICENSE.md`](../LICENSE.md)
para el texto legal completo.

- **SSPL v1 (gratuita):** cubre uso, pruebas y desarrollo, incluyendo consumir esta API para
  integraciones internas de tu organización (Grafana, scripts propios, CI/CD).
- **Restricción de servicio (Sección 13 de la SSPL v1):** si construyes un servicio de cara a
  terceros cuyo valor derive entera o principalmente de Azkin — por ejemplo, revender monitoreo
  usando esta API como backend para tus propios clientes —, la SSPL v1 te exige publicar el
  "Service Source Code" completo de ese servicio bajo la misma licencia.
- **Licencia Comercial:** libera de la obligación anterior. Contacta a
  **espinozathan@gmail.com** para solicitarla.

Toda respuesta HTTP de la API (sesión y pública) incluye dos headers informativos que reflejan
este aviso:

```text
X-License: SSPL-1.0
X-License-Notice: Azkin esta licenciado bajo SSPL v1. Ofrecer esta API o su funcionalidad a
  terceros como un servicio comercial requiere una Licencia Comercial
  (contacto: espinozathan@gmail.com). Ver LICENSE.md.
```

Estos headers son un recordatorio informativo, no un mecanismo de control de acceso: no
reemplazan el texto legal de `LICENSE.md` ni un contrato de licencia comercial firmado.
