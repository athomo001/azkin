// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import https from "https";
import express from "express";
import {
  FederationServerConfig,
  FederationServerStatus,
  IFederationServerManager,
} from "../../application/ports/services/federation-server-manager";
import { logger } from "../logger";

/**
 * Administra el listener mTLS dedicado de federación, sobre su propia app Express (nunca la
 * principal — solo expone `/federation/monitors` y `/federation/sync`, ver federation-peer.routes.ts).
 * Mismo patrón "swap after confirm" que `HttpsServerManager`: solo apaga el listener anterior tras
 * confirmar que el nuevo arrancó correctamente.
 */
export class FederationServerManager implements IFederationServerManager {
  private currentServer: https.Server | null = null;
  private currentPort: number | null = null;

  constructor(private readonly app: express.Express) {}

  async reload(config: FederationServerConfig): Promise<void> {
    const options: https.ServerOptions = {
      cert: config.certPem,
      key: config.keyPem,
      minVersion: "TLSv1.2",
      // Sin cadena de CA: se acepta cualquier certificado de cliente a nivel de handshake, y la
      // huella se valida a nivel de aplicación (verify-peer-certificate.ts) contra las instancias
      // enroladas — pinning, no cadena de confianza (ver AZ-049).
      requestCert: true,
      rejectUnauthorized: false,
    };
    const newServer = https.createServer(options, this.app);

    await new Promise<void>((resolve, reject) => {
      const onError = (err: Error): void => reject(err);
      newServer.once("error", onError);
      newServer.listen(config.port, () => {
        newServer.removeListener("error", onError);
        resolve();
      });
    });

    const previousServer = this.currentServer;
    this.currentServer = newServer;
    this.currentPort = config.port;

    if (previousServer) {
      previousServer.close((err) => {
        if (err) logger.warn(`Error al cerrar el listener de federación anterior: ${err.message}`);
      });
    }
  }

  getStatus(): FederationServerStatus {
    return { active: this.currentServer !== null, port: this.currentPort ?? undefined };
  }

  stop(): void {
    this.currentServer?.close();
    this.currentServer = null;
    this.currentPort = null;
  }
}
