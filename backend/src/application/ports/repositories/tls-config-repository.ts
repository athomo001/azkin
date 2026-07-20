// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { ITlsConfig } from "../../../domain/entities/tls-config";

export interface UpsertTlsConfigData {
  certPem: string;
  keyPemEncrypted: string;
  chainPem?: string;
  port: number;
  httpRedirect: boolean;
  updatedById: string;
}

/**
 * Puerto (interfaz) para la persistencia de la configuración TLS del sistema (documento único).
 */
export interface ITlsConfigRepository {
  getActive(): Promise<ITlsConfig | null>;
  upsert(data: UpsertTlsConfigData): Promise<ITlsConfig>;
  /** Elimina la configuración TLS activa, si existe (usado por "Purgar instancia"). */
  deleteActive(): Promise<boolean>;
}
