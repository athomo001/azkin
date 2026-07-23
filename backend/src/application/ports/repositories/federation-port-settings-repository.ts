// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederationPortSettings } from "../../../domain/entities/federation-port-settings";

export interface UpsertFederationPortSettingsData {
  port: number;
  updatedById: string;
}

/**
 * Puerto (interfaz) para el singleton de override del puerto de federación. Mismo patrón que
 * `IMonitoringEngineSettingsRepository`: un único documento, `getActive()`/`upsert()`.
 */
export interface IFederationPortSettingsRepository {
  getActive(): Promise<IFederationPortSettings | null>;
  upsert(data: UpsertFederationPortSettingsData): Promise<IFederationPortSettings>;
}
