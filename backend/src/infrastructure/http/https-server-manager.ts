// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import https from "https";
import express from "express";
import { ITlsServerManager, TlsServerConfig, TlsServerStatus } from "../../application/ports/services/tls-server-manager";
import { logger } from "../logger";

/**
 * Administra el listener HTTPS nativo del backend. Reutiliza la misma app Express que el
 * servidor HTTP existente. Al recargar, solo apaga el listener anterior después de confirmar
 * que el nuevo arrancó correctamente (evita dejar el servicio sin HTTPS ante una config inválida).
 */
export class HttpsServerManager implements ITlsServerManager {
  private currentServer: https.Server | null = null;
  private currentPort: number | null = null;
  private currentHttpRedirect = false;

  constructor(private readonly app: express.Express) {}

  async reload(config: TlsServerConfig): Promise<void> {
    const options: https.ServerOptions = {
      cert: config.certPem,
      key: config.keyPem,
      ca: config.chainPem,
      minVersion: "TLSv1.2",
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
    this.currentHttpRedirect = config.httpRedirect;

    if (previousServer) {
      previousServer.close((err) => {
        if (err) logger.warn(`Error al cerrar el listener HTTPS anterior: ${err.message}`);
      });
    }
  }

  getStatus(): TlsServerStatus {
    return {
      active: this.currentServer !== null,
      port: this.currentPort ?? undefined,
      httpRedirect: this.currentHttpRedirect,
    };
  }

  stop(): void {
    this.currentServer?.close();
    this.currentServer = null;
    this.currentPort = null;
  }
}
