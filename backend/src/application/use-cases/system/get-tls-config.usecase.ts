// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { X509Certificate } from "crypto";
import { ITlsConfigRepository } from "../../ports/repositories/tls-config-repository";
import { ITlsServerManager } from "../../ports/services/tls-server-manager";

export interface TlsConfigStatus {
  configured: boolean;
  port?: number;
  httpRedirect?: boolean;
  validTo?: string;
  fingerprint?: string;
  updatedAt?: Date;
  listenerActive: boolean;
}

/**
 * Caso de uso para consultar el estado de la configuración TLS sin exponer la clave privada.
 */
export class GetTlsConfigUseCase {
  constructor(
    private readonly tlsConfigs: ITlsConfigRepository,
    private readonly tlsServerManager: ITlsServerManager,
  ) {}

  async execute(): Promise<TlsConfigStatus> {
    const config = await this.tlsConfigs.getActive();
    const listenerStatus = this.tlsServerManager.getStatus();

    if (!config) {
      return { configured: false, listenerActive: listenerStatus.active };
    }

    let validTo: string | undefined;
    let fingerprint: string | undefined;
    try {
      const cert = new X509Certificate(config.certPem);
      validTo = cert.validTo;
      fingerprint = cert.fingerprint256;
    } catch {
      // El certificado persistido ya fue validado al guardarse; esto solo protege la lectura.
    }

    return {
      configured: true,
      port: config.port,
      httpRedirect: config.httpRedirect,
      validTo,
      fingerprint,
      updatedAt: config.updatedAt,
      listenerActive: listenerStatus.active,
    };
  }
}
