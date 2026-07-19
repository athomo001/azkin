# API Pública de Azkin (AZ-029)

La API pública permite integrar sistemas externos (dashboards, scripts, CI/CD) con Azkin sin usar
una sesión de usuario. Se autentica con una **API Key** en vez del JWT de sesión.

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
