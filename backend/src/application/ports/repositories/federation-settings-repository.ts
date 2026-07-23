// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederationSettings } from "../../../domain/entities/federation-settings";

export interface UpsertFederationSettingsData {
  ownUrl: string;
  updatedById: string;
}

/**
 * Puerto (interfaz) para el singleton de configuración de red de federación (hoy, solo la
 * dirección propia). Mismo patrón que `IMonitoringEngineSettingsRepository`: un único documento,
 * `getActive()`/`upsert()`.
 */
export interface IFederationSettingsRepository {
  getActive(): Promise<IFederationSettings | null>;
  upsert(data: UpsertFederationSettingsData): Promise<IFederationSettings>;
}
