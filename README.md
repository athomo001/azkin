# <p align="center"><img src="assets/logo.png" alt="Azkin Logo" width="200"/></p>

# <p align="center">Azkin</p>

<p align="center">
  <strong>Plataforma de monitoreo multiusuario en tiempo real.</strong>
</p>

---

## Descripción General

**Azkin** es una solución robusta y moderna diseñada para el monitoreo de disponibilidad y rendimiento de servicios en tiempo real. Utiliza una arquitectura limpia y desacoplada para garantizar escalabilidad, seguridad y alto rendimiento.

El proyecto está compuesto principalmente por el backend de la API y las utilidades de control y especificación.

## Estructura del Repositorio

- **[assets](file:///c:/Users/despinoza/Documents/Proyectos%20locales/azkin/assets)**: Recursos visuales del proyecto, incluyendo el logo.
- **[backend](file:///c:/Users/despinoza/Documents/Proyectos%20locales/azkin/backend)**: Servidor de la aplicación escrito en **Node.js (>= 24.13.0)**, **Express 5.x**, **TypeScript** estricto y **MongoDB/Mongoose**.
- **[spec](file:///c:/Users/despinoza/Documents/Proyectos%20locales/azkin/spec)**: Especificaciones del diseño del sistema, bases de datos y contratos de la API.

---

## Inicio Rápido

Para iniciar el entorno completo de desarrollo (incluyendo el backend y una base de datos MongoDB local) utilizando Docker:

```bash
# Levantar el entorno de desarrollo local con recarga en caliente (hot-reload)
docker compose -f compose.dev.yaml up --build
```

Si deseas ejecutar el backend localmente de forma directa, dirígete al directorio de **[backend](file:///c:/Users/despinoza/Documents/Proyectos%20locales/azkin/backend)** y sigue las instrucciones descritas en su README:

```bash
cd backend
pnpm install
pnpm run dev
```

---

## Seguridad y Auditoría

Este espacio está configurado bajo estándares de seguridad estrictos y es utilizado para monitoreo autorizado y auditorías de disponibilidad de red.

*Diseñado bajo principios de Clean Architecture.*
