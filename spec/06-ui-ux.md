# Fase 4 — Especificación de UI/UX y Frontend: Azkin

> Estado: **Aprobada** · Metodología: Spec-Driven Development (SDD)
> Deriva de [`01-general.md`](01-general.md) y se comunica a través de los contratos definidos en [`04-contratos-api.md`](04-contratos-api.md).

Este documento establece las directrices de interfaz de usuario (UI), experiencia de usuario (UX) y arquitectura frontend para evitar el "aspecto genérico" (típico de paneles administrativos generados automáticamente o por IA) y garantizar un producto de categoría "Premium".

---

## 1. Principios de Diseño: "Premium y Potente"

El objetivo visual de Azkin es transmitir robustez, modernidad y alta calidad desde el primer vistazo, alejándose por completo de los diseños prefabricados básicos de frameworks CSS.

### 1.1 Estética General y Tema
- **Dark Mode Nativo y Profundo**: El sistema operará principalmente en un modo oscuro meticulosamente curado (ej. usando escalas profundas como `slate-950` o `zinc-950` de Tailwind), con soporte para temas claros igual de pulidos.
- **Glassmorphism y Profundidad**: Uso estratégico de transparencias, desenfoques de fondo (`backdrop-blur`) y sombras multicapa difusas para dar profundidad a las tarjetas, modales y barras de navegación.
- **Paleta de Colores Curada**: 
  - **Cero colores genéricos**: Los indicadores de estado (UP/DOWN/PENDING) utilizarán tonos luminosos, vibrantes y armónicos (ej. *Esmeralda brillante* para UP, *Carmesí neón* o *Rosa intenso* para DOWN, *Ámbar dorado* para advertencias).
  - Uso intensivo del espacio en blanco (o negativo) para darle respiro a la interfaz.

### 1.2 Tipografía Moderna
- **Fuentes premium**: Sustituir la tipografía estándar por fuentes modernas sans-serif diseñadas para interfaces densas en datos (ej. **Inter**, **Outfit**, o **Geist**).
- **Jerarquía estricta**: Contraste claro entre pesos tipográficos (Light para textos secundarios, Medium/Semibold para etiquetas, ExtraBold para métricas destacadas).

### 1.3 Micro-interacciones y Animaciones (UI viva)
- **Sensación de dinamismo**: La interfaz debe sentirse "viva". Cada botón y tarjeta debe tener retroalimentación al hacer *hover* (escalado sutil, cambio de brillo o sombras dinámicas).
- **Transiciones fluidas**: Uso de transiciones en todos los cambios de estado (animaciones de entrada/salida de listas, expansión de paneles).
- **Skeleton Loaders**: Sustituir los clásicos "spinners" de carga por esqueletos animados que simulan la estructura del contenido antes de que se reciba desde el backend.

---

## 2. Componentes Clave de la Experiencia

### 2.1 Tablero Principal (Dashboard)
- Gráficos de series de tiempo de última generación renderizados con Apache ECharts. Deben incorporar gradientes de área debajo de la línea y tooltips interactivos estilizados.
- Indicadores estilo "heatmap" o "uptime-bar" (bloques verdes/rojos contiguos) con tooltips que muestren la latencia y el estado de ese instante.
- Píldoras (Badges) de estado con bordes brillantes y un sutil "pulso" animado (ping) para servicios en estado crítico.

### 2.2 Gestión sin fricción
- Formularios presentados en paneles laterales interactivos (Slide-overs) o modales expansivos en lugar de simples saltos de página, para mantener el contexto visual.

---

## 3. Arquitectura Frontend (Angular)

Para materializar esta experiencia sin afectar el rendimiento técnico:

| Aspecto | Decisión y Tecnología |
|---|---|
| **Framework Base** | Angular 19+ (Standalone Components). Nada de `NgModules`. |
| **Estilos y Layout** | Tailwind CSS v3/v4 con un sistema de tokens configurado a medida en `tailwind.config.ts`. |
| **Gestión de Estado** | **Signals** nativos de Angular. Reactividad fina, sin librerías pesadas como NgRx. |
| **Estructura** | Modularidad basada en *Features* (`/features/dashboard`, `/features/auth`) y *Shared UI* (`/shared/components`). |
| **Integración Real-Time** | Servicios especializados que se conecten a Socket.io, emitiendo actualizaciones de los Signals directamente para mutar el DOM sin parpadeos. |

## 4. Criterio de Aceptación Visual
Cualquier vista desarrollada debe pasar la prueba del "Vistazo Premium". Si la interfaz luce como un "template básico de Bootstrap/Tailwind", el PR/Merge será rechazado. Se exige atención extrema al detalle visual.

---

## 5. Trazabilidad de fases (SDD)

| Fase | Entregable | Estado |
|---|---|---|
| 1 — Arquitectura y stack | [`02-arquitectura.md`](02-arquitectura.md) | ✅ Aprobada |
| 2 — Modelado de datos | [`03-modelo-datos.md`](03-modelo-datos.md) | ✅ Aprobada |
| 3 — Contratos de API REST | [`04-contratos-api.md`](04-contratos-api.md) | ✅ Aprobada |
| 4 — UI/UX y frontend | Este documento | ✅ Aprobada |
| 5 — Motor de monitoreo | [`05-motor-monitoreo.md`](05-motor-monitoreo.md) | ✅ Aprobada |
