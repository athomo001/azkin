// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface FederationServerConfig {
  certPem: string;
  keyPem: string;
  port: number;
}

export interface FederationServerStatus {
  active: boolean;
  port?: number;
}

/**
 * Puerto (interfaz) para administrar el listener mTLS dedicado de federación (AZ-049, slice 2) —
 * separado del listener HTTPS principal (`ITlsServerManager`): puerto propio, app Express propia
 * (solo expone los endpoints peer-to-peer), y exige certificado de cliente (`requestCert`), sin
 * cadena de CA — la validación real es el pinning por huella ya usado en el enrollment.
 */
export interface IFederationServerManager {
  reload(config: FederationServerConfig): Promise<void>;
  getStatus(): FederationServerStatus;
  stop(): void;
}
