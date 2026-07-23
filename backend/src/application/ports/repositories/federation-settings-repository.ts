// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederationPortSettings } from "../../../domain/entities/federation-port-settings";

export interface UpsertFederationPortSettingsData {
  port?: number;
  ownUrl?: string;
  updatedById: string;
}

/**
 * Puerto (interfaz) para el singleton de configuración de red de federación (puerto + dirección
 * propia). A diferencia de `IMonitoringEngineSettingsRepository` (que siempre recibe todos sus
 * campos juntos), acá `upsert` es un parche parcial: guardar solo `port` no debe borrar un
 * `ownUrl` ya guardado, y viceversa (ver la implementación Mongoose, que usa `$set`).
 */
export interface IFederationPortSettingsRepository {
  getActive(): Promise<IFederationPortSettings | null>;
  upsert(data: UpsertFederationPortSettingsData): Promise<IFederationPortSettings>;
}
