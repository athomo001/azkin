// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface TlsServerConfig {
  certPem: string;
  keyPem: string;
  chainPem?: string;
  port: number;
  httpRedirect: boolean;
}

export interface TlsServerStatus {
  active: boolean;
  port?: number;
  httpRedirect: boolean;
}

/**
 * Puerto (interfaz) para administrar el listener HTTPS nativo del backend en runtime.
 */
export interface ITlsServerManager {
  /** Levanta (o reemplaza) el listener HTTPS con la nueva configuración. Solo apaga el listener
   *  anterior tras confirmar que el nuevo arrancó correctamente. */
  reload(config: TlsServerConfig): Promise<void>;
  getStatus(): TlsServerStatus;
  /** Apaga el listener HTTPS activo, si existe (usado en el shutdown del proceso). */
  stop(): void;
}
