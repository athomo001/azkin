# --- Etapa de build ---
FROM node:24-alpine AS build
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN pnpm run build

# --- Etapa de runtime ---
FROM node:24-alpine AS runtime
ARG APP_VERSION=1.1.0
LABEL org.opencontainers.image.version="${APP_VERSION}"
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app
ENV NODE_ENV=production
# iputils provee un binario `ping` compatible con la librería de monitoreo ICMP y ca-certificates para HTTPS
RUN apk add --no-cache iputils ca-certificates
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/dist ./dist
# AZ-065: correr como usuario sin privilegios — antes el proceso Node corría como root, ampliando
# innecesariamente el radio de impacto de cualquier RCE futura. Usa el usuario `node` ya incluido
# en la imagen node:24-alpine (uid 1000). El checker de Ping necesita CAP_NET_RAW para su socket
# ICMP crudo aun como no-root: se otorga a nivel de contenedor vía `cap_add: [NET_RAW]` en
# compose.yaml/compose.dev.yaml, no aquí.
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
