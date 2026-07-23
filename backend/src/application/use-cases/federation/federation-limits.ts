// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Límite duro de instancias federadas simultáneas (AZ-049): decisión de alcance deliberada,
 * no una limitación técnica temporal — herramienta pensada para un puñado de regiones, no
 * para una malla grande.
 */
export const MAX_FEDERATED_INSTANCES = 5;

/** Intervalo del tick de sondeo periódico (minutos). */
export const FEDERATION_SYNC_INTERVAL_MINUTES = 2;

/** Umbral (segundos) sin un sondeo exitoso para considerar "federación sin reportar" — fijo por
 * ahora (3x el intervalo del tick), no configurable por Admin, para no sumar otra pantalla de
 * configuración al alcance ya grande de esta issue. */
export const FEDERATION_REPORTING_THRESHOLD_SECONDS = FEDERATION_SYNC_INTERVAL_MINUTES * 60 * 3;
