# Changelog

Todos los cambios notables de **Azkin** se documentan aquí.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y sigue [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] - 2026-07-16

### Added
- **Monitoreo SNMP v1/v2c/v3:** Implementación básica para configuración y lectura de OIDs en equipos de red.
- **Canales de Alerta (SMTP/SMTP Seguro):** Formulario avanzado en el panel de configuración para el envío de alertas de caída mediante servidor SMTP y notificaciones multicanal.
- **Bypass de Cloudflare WAF:** Capacidad de detección inteligente de proxies de Cloudflare (estados 403/503 con firmas CF), marcando la conexión como `UP (CF WAF)` en lugar de reportar caídas falsas.
- **Modo Nyan Cat (Easter Egg):** Activación visual en los gráficos de latencia. Un Nyan Cat animado de gran escala (`[85, 52]`) vuela en tiempo real siguiendo el último punto de latencia registrado.
- **Efecto de Transición de Tema (Claro/Oscuro):** Implementación de View Transitions API con efecto de círculo envolvente que se propaga desde la posición del cursor en ambas direcciones.

### Changed
- **Nombres de Contenedores Docker:** Modificados a nombres estáticos semánticos: `azkin-front`, `azkin-back` y `azkin-db`.
- **MongoDB 8.x:** Actualización del motor de base de datos de la versión 7 a la 8 en todos los entornos Docker compose.
- **pnpm 11.13.1:** Actualización global y del `packageManager` en el frontend para forzar el uso de la versión de pnpm más reciente.
- **Panel de Configuración `/settings` Premium:** Rediseño estilo SaaS premium inspirado en Vercel, con sub-menús horizontales dinámicos y pie de acciones a la derecha.
- **Visualización de Gráficos de Grupo:** Aumento de fuentes y tamaño de leyenda con bloques de color grandes y legibles, diseñado para su visualización en pantallas gigantes (TV).
- **Eliminación de Alertas Nativas:** Reemplazo de los diálogos `alert()` del navegador por modales de confirmación personalizados y notificaciones interactivas (toasts).

### Fixed
- **Validación de URL:** Autocompletado automático de protocolos `http://` / `https://` y validación de sintaxis en el guardado de monitores.
- **Renderizado Reactivo de Gráficos:** Vinculación de efectos de Angular (`effect()`) para forzar la actualización inmediata de los gráficos de ECharts al cambiar el tema o el modo Nyan Cat sin recargar la página (cero F5).
- **Caché e Instantaneidad en SSL/WHOIS:** Optimización en las verificaciones periódicas de certificados y dominios para evitar tiempos de espera prolongados.
