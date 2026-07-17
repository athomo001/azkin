# Backlog de Issues

Este archivo concentra problemas detectados para resolver en siguientes iteraciones.

## Estado
- [ ] Abierto
- [x] Resuelto

## AZ-001) Permisos de viewers no aplican correctamente y pueden crear monitores
- Codigo: AZ-001
- Estado: [ ] Abierto
- Prioridad: Alta
- Reportado: 2026-07-16

### Descripcion
Se configuraron permisos combinados para viewer (grupos, monitores especificos y/o ver todo), pero al iniciar sesion no visualizan informacion.
Adicionalmente, un viewer puede agregar monitores, y eso no debe permitirse: el viewer solo debe poder revisar/consultar.

### Comportamiento esperado
1. Si el viewer tiene permiso `all`, debe ver todo el inventario autorizado por su admin.
2. Si el viewer tiene permisos por `group` o `monitor`, debe ver solo esos recursos.
3. El viewer no debe poder crear, editar, pausar, eliminar ni reconfigurar monitores.
4. El viewer solo puede leer estado, historial y paneles permitidos.

### Criterios de aceptacion
1. Login viewer con `all`: lista y detalle visibles.
2. Login viewer con `group`: solo monitores del grupo autorizado.
3. Login viewer con `monitor`: solo monitores explicitamente autorizados.
4. Endpoints de escritura devuelven 403 para viewer.
5. UI oculta acciones de escritura para viewer (crear/editar/eliminar/pausar).

### Pistas de investigacion
- Verificar filtros de permisos en casos de uso de stats y monitores.
- Revisar middleware de autorizacion por rol para endpoints mutables.
- Alinear permisos backend + ocultamiento de acciones en frontend.

---

## AZ-002) Login muestra ayuda para crear administrador; debe reemplazarse por recuperacion de contrasena
- Codigo: AZ-002
- Estado: [ ] Abierto
- Prioridad: Media-Alta
- Reportado: 2026-07-16

### Descripcion
En la pantalla de login aparece un texto/enlace para crear administradores. En produccion no debe mostrarse ese flujo.
En su lugar, debe existir opcion de recuperacion de contrasena.

### Comportamiento esperado
1. El login no muestra CTA de crear administrador.
2. El login muestra enlace "Recuperar contrasena".
3. Existe flujo de recuperacion (solicitud + validacion + cambio de contrasena).

### Criterios de aceptacion
1. UI login sin enlace de registro admin.
2. UI login con enlace de recuperacion.
3. Endpoint para solicitar recuperacion con respuesta generica (sin filtrar existencia de usuario).
4. Endpoint para restablecer contrasena con token valido y expiracion.
5. Auditoria minima del evento de recuperacion (solicitud y cambio).

### Pistas de investigacion
- Definir si el registro admin queda solo para bootstrap inicial controlado.
- Implementar token temporal firmado/almacenado con expiracion corta.
- Mantener mensajes anti-enumeracion para seguridad.

---

## AZ-003) Implementar versionamiento del sistema
- Codigo: AZ-003
- Estado: [ ] Abierto
- Prioridad: Media
- Reportado: 2026-07-16

### Descripcion
Actualmente no existe una estrategia clara para versionar el sistema y sus cambios desplegados.
Se requiere definir e implementar versionado para facilitar trazabilidad, soporte y compatibilidad entre frontend, backend y despliegues.

### Comportamiento esperado
1. El sistema usa una convencion de versionado definida (ej. SemVer).
2. Cada release registra version, fecha y cambios relevantes.
3. Backend expone version actual por endpoint o metadata operativa.
4. Frontend muestra la version de la aplicacion en una zona visible (pie de pagina o pantalla de login).
5. El pipeline/proceso de build permite inyectar o fijar version de forma consistente.

### Criterios de aceptacion
1. Existe documento corto con la politica de versionado (major/minor/patch).
2. Se actualiza version en cada release de forma automatizable o estandarizada.
3. Endpoint de health/info devuelve version ejecutada.
4. UI muestra la misma version que reporta el backend o artefacto de build.
5. `CHANGELOG.md` se mantiene alineado con las versiones publicadas.

### Pistas de investigacion
- Evaluar fuente unica de verdad para version (tag git, package.json o variable de entorno de build).
- Definir convencion de tagging en git (`vX.Y.Z`) y reglas para pre-releases.
- Asegurar que Docker/Compose propaguen version al runtime sin inconsistencias.

---

## AZ-004) Admin debe poder configurar plantillas de notificaciones por canal (correo, webhook y Telegram)
- Codigo: AZ-004
- Estado: [ ] Abierto
- Prioridad: Alta
- Reportado: 2026-07-16

### Descripcion
Hace falta una configuracion interna para que el admin pueda definir el contenido de las notificaciones por canal.
Debe poder decidir el formato del correo, el payload/texto del webhook y el mensaje de Telegram, con opciones dinamicas segun el evento del monitor (por ejemplo: caida, recuperacion, latencia alta).

### Comportamiento esperado
1. El admin puede configurar plantilla por canal: email, webhook y Telegram.
2. Cada plantilla permite variables dinamicas (ej.: monitor, URL, estado, fecha/hora, codigo HTTP, tiempo de respuesta).
3. Se soportan al menos eventos de `DOWN` (caida) y `RECOVERED` (levantado), y queda preparado para otros eventos.
4. Existe vista previa del mensaje final antes de guardar/enviar prueba.
5. El sistema valida formato minimo por canal (ej. JSON valido para webhook, asunto/cuerpo para email).

### Criterios de aceptacion
1. UI de administracion con seccion de plantillas por canal y por tipo de evento.
2. Guardado y lectura de plantillas persistidas por organizacion/admin.
3. En disparo real de alerta, el mensaje usa la plantilla configurada y reemplaza variables correctamente.
4. Si una variable no existe, se informa error de configuracion sin romper el envio global.
5. Existe accion de "enviar prueba" por canal para validar integraciones y formato.

### Pistas de investigacion
- Definir catalogo oficial de variables dinamicas disponibles por tipo de evento.
- Separar motor de render de plantillas del transporte (email/webhook/telegram).
- Incluir versionado de plantillas para evitar cambios destructivos en caliente.

---

## AZ-005) Copia de seguridad y restauracion: reemplazo de respaldo anterior y borrado masivo de webs monitoreadas
- Codigo: AZ-005
- Estado: [ ] Abierto
- Prioridad: Alta
- Reportado: 2026-07-16

### Descripcion
En el flujo de respaldos falta una opcion para borrar o reemplazar el respaldo anterior cuando se genera uno nuevo, evitando solape o duplicacion de informacion.
Ademas, se necesita una accion administrativa para borrar de forma masiva webs monitoreadas, con controles de seguridad para evitar eliminaciones accidentales.

### Comportamiento esperado
1. En "Copia de Seguridad y Restauracion" existe opcion para crear nuevo respaldo reemplazando el anterior.
2. El sistema permite elegir entre "acumular respaldos" o "reemplazar ultimo respaldo".
3. Al reemplazar, no quedan datos solapados ni metadatos inconsistentes.
4. Existe opcion de seleccion multiple para borrar masivamente webs monitoreadas.
5. El borrado masivo requiere confirmacion explicita y muestra resumen de impacto antes de ejecutar.

### Criterios de aceptacion
1. UI de respaldos con selector claro de estrategia (acumular/reemplazar).
2. Al generar respaldo en modo reemplazo, el respaldo anterior queda eliminado o archivado segun politica definida.
3. Restauracion valida integridad del respaldo y evita mezcla de estados previos.
4. UI de monitores permite seleccionar multiples webs y eliminarlas en una sola operacion.
5. Endpoint de borrado masivo registra auditoria minima (quien, cuando, cuantos, ids).

### Pistas de investigacion
- Definir politica de retencion de respaldos (ultimo, N ultimos, por fecha).
- Garantizar operacion atomica o transaccional para evitar respaldo parcial/corrupto.
- Implementar "soft delete" opcional para recuperacion rapida ante errores de borrado masivo.

---

## AZ-006) Configuracion interna de certificados SSL/TLS y puerto HTTPS configurable
- Codigo: AZ-006
- Estado: [ ] Abierto
- Prioridad: Alta
- Reportado: 2026-07-16

### Descripcion
Se requiere una opcion interna para cargar y administrar certificados SSL/TLS, de modo que la plataforma pueda correr de forma segura en HTTPS.
El admin debe poder elegir puerto de escucha (por defecto 443 u otro puerto personalizado) y dejar la configuracion operativa de forma simple, segura y robusta.

### Comportamiento esperado
1. El admin puede cargar certificado, clave privada y cadena intermedia desde UI o configuracion guiada.
2. El sistema permite definir el puerto HTTPS (443 por defecto) o uno personalizado.
3. La validacion de certificados detecta errores de formato, vencimiento y pares clave-certificado invalidos.
4. Al aplicar cambios, el servicio queda operativo sin dejar estados intermedios inseguros.
5. La configuracion incluye buenas practicas de seguridad TLS (protocolos/cifrados permitidos y redireccion opcional de HTTP a HTTPS).

### Criterios de aceptacion
1. Existe flujo de configuracion simple con validaciones y mensajes claros para el admin.
2. La plataforma levanta correctamente en HTTPS en el puerto configurado.
3. Se puede cambiar de puerto sin romper acceso administrativo ni endpoints principales.
4. Si la configuracion es invalida, el sistema revierte al estado estable anterior y reporta el error.
5. Se registran auditorias de cambios de certificados y puertos (quien, cuando, que cambio).

### Pistas de investigacion
- Definir almacenamiento seguro para claves privadas (cifrado en reposo y acceso restringido).
- Evaluar soporte para renovacion de certificados y alertas previas a vencimiento.
- Verificar compatibilidad con Docker/Compose y puertos expuestos para despliegues en distintos entornos.

---

## AZ-007) Notificaciones centralizadas por tipo de alerta, incluyendo Defacement
- Codigo: AZ-007
- Estado: [ ] Abierto
- Prioridad: Alta
- Reportado: 2026-07-16

### Descripcion
Se necesita centralizar la configuracion de eventos de notificacion para que cada canal pueda recibir todas las alertas o solo tipos especificos.
Adicionalmente, debe contemplarse explicitamente la alerta de Defacement dentro de los eventos configurables.

### Comportamiento esperado
1. Al crear o editar un canal, el admin puede elegir modo "todas las alertas" o "solo alertas seleccionadas".
2. El catalogo de eventos incluye al menos: `DOWN`, `RECOVERED`, `LATENCY_HIGH` y `DEFACEMENT`.
3. La seleccion de eventos se gestiona en un unico punto centralizado de configuracion.
4. El sistema permite combinar canales con estrategias distintas (ej.: Telegram todo, email solo Defacement y caidas).
5. El disparo de notificaciones respeta exactamente la seleccion de eventos definida por canal.

### Criterios de aceptacion
1. UI muestra selector claro de alcance: todas vs eventos especificos.
2. Existe selector multiple de eventos con `DEFACEMENT` disponible.
3. Guardado y carga de la configuracion mantienen consistencia sin perder eventos seleccionados.
4. Pruebas funcionales verifican que una alerta de Defacement se envia solo a los canales habilitados para ese evento.
5. Existe vista/resumen central que permita auditar rapido que eventos envia cada canal.

### Pistas de investigacion
- Definir enum unico de eventos de alerta compartido entre backend y frontend.
- Evitar duplicidad entre configuracion de plantillas (contenido) y configuracion de enrutamiento (eventos).
- Considerar migracion de canales existentes a un valor por defecto seguro (por ejemplo, "todas las alertas").
