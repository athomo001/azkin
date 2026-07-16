# --- Etapa de build ---
FROM node:24-alpine AS build
RUN corepack enable && corepack prepare pnpm@11.13.1 --activate
WORKDIR /app

# Instala dependencias primero para aprovechar el caché de capas
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Copia el código fuente y compila en modo producción
COPY . .
RUN pnpm run build

# --- Etapa de runtime ---
# Nginx alpine ultra-slim para servir el bundle estático de Angular
FROM nginx:alpine AS runtime

# Inyecta la configuración personalizada:
#   - try_files para Angular Router (SPA fallback a index.html)
#   - proxy /api/ → backend:3000
#   - proxy /socket.io/ → backend:3000 (con upgrade WebSocket)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos compilados de Angular al directorio público de Nginx
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
