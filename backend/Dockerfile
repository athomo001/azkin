# --- Etapa de build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Etapa de runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# iputils provee un binario `ping` compatible con la librería de monitoreo ICMP
RUN apk add --no-cache iputils
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
