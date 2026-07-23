// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Vínculo entre un monitor local y su equivalente en una instancia federada (AZ-049, slice 2).
 * Modelado como pares anclados en el monitor local (no como un "grupo" con id sincronizado entre
 * instancias, que exigiría coordinación sin autoridad compartida) — un monitor local puede tener
 * N vínculos, uno por cada peer con el que se comparó, logrando el mismo resultado visual
 * ("combinar 3 regiones") sin sincronizar nada entre instancias independientes.
 */
export interface IFederatedMonitorLink {
  id: string;
  localMonitorId: string;
  federatedInstanceId: string;
  remoteMonitorId: string;
  remoteMonitorLabel: string;
  createdById: string;
  createdAt: Date;
  /** Último sondeo exitoso de este vínculo puntual (distinto del de la instancia en general). */
  lastSyncedAt: Date | null;
}
