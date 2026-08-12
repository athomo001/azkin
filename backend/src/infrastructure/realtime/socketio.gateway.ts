// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Server, Socket } from "socket.io";
import { IRealtimePublisher } from "../../application/ports/services/realtime-publisher";
import { ITokenService } from "../../application/ports/services/security";
import { IHeartbeat } from "../../domain/entities/heartbeat";
import { logger } from "../logger";

/**
 * Canal de solo lectura. Autentica cada socket por JWT y lo une a la room de su
 * usuario; los heartbeats y eventos de federación se emiten a esa room (aislamiento).
 */
export class SocketIoGateway implements IRealtimePublisher {
  constructor(
    private readonly io: Server,
    private readonly tokens: ITokenService,
  ) {
    this.io.use((socket, next) => {
      try {
        const token = this.extractToken(socket);
        const payload = this.tokens.verify(token, "access");

        // Si es viewer, se une a la room del Admin propietario; si no, a la propia.
        const roomToJoin = (payload.role === "viewer" && payload.adminId ? payload.adminId : payload.userId).toString();

        socket.data.userId = payload.userId.toString();
        socket.data.room = roomToJoin;
        void socket.join(roomToJoin);
        next();
      } catch {
        next(new Error("No autorizado"));
      }
    });

    this.io.on("connection", (socket) => {
      const userId = socket.data.userId as string;
      const room = socket.data.room as string;
      logger.info(`Socket conectado para usuario ${userId} en sala ${room}`);
    });
  }

  publishHeartbeat(userId: string, beat: IHeartbeat): void {
    this.io.to(userId.toString()).emit("heartbeat", {
      monitorId: beat.monitorId,
      timestamp: beat.timestamp.toISOString(),
      status: beat.status,
      ping: beat.ping,
      msg: beat.msg,
      certExpiry: beat.certExpiry ?? null,
      certExpiryAt: beat.certExpiryAt ? beat.certExpiryAt.toISOString() : null,
      domainExpiry: beat.domainExpiry ?? null,
      isLocalNetworkDown: beat.isLocalNetworkDown ?? false,
    });
  }

  publishFederationEnrolled(userId: string, label: string): void {
    // Emitir a la sala del usuario y globalmente para notificar al Admin del Nodo 1 en tiempo real
    this.io.to(userId.toString()).emit("federation:enrolled", { label });
    this.io.emit("federation:enrolled", { label });
  }

  publishFederationLinksUpdated(userId: string): void {
    this.io.to(userId.toString()).emit("federation:links-updated", {});
    this.io.emit("federation:links-updated", {});
  }

  private extractToken(socket: Socket): string {
    const fromAuth = socket.handshake.auth?.token;
    if (typeof fromAuth === "string" && fromAuth.length > 0) return fromAuth;

    const header = socket.handshake.headers.authorization;
    if (typeof header === "string" && header.startsWith("Bearer ")) {
      return header.slice("Bearer ".length);
    }

    // AZ-066: sin fallback por query string (?token=...) — el frontend nunca lo usa
    // (realtime.service.ts solo manda `auth: { token }`) y un JWT en la URL queda expuesto en
    // logs de acceso/historial del navegador, mismo riesgo que ya evita metrics-auth.ts a propósito.
    throw new Error("missing token");
  }
}
