import { Server, Socket } from "socket.io";
import { IRealtimePublisher } from "../../application/ports/services/realtime-publisher";
import { ITokenService } from "../../application/ports/services/security";
import { IHeartbeat } from "../../domain/entities/heartbeat";
import { logger } from "../logger";

/**
 * Canal de solo lectura. Autentica cada socket por JWT y lo une a la room de su
 * usuario; los heartbeats se emiten exclusivamente a esa room (aislamiento).
 */
export class SocketIoGateway implements IRealtimePublisher {
  constructor(
    private readonly io: Server,
    private readonly tokens: ITokenService,
  ) {
    this.io.use((socket, next) => {
      try {
        const token = this.extractToken(socket);
        const payload = this.tokens.verify(token);
        
        // Si es viewer, se une a la room del Admin propietario; si no, a la propia. Forzar conversión a string.
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
    // Forzar conversión del room/userId a string para evitar errores con ObjectId de Mongoose
    this.io.to(userId.toString()).emit("heartbeat", {
      monitorId: beat.monitorId,
      timestamp: beat.timestamp.toISOString(),
      status: beat.status,
      ping: beat.ping,
      msg: beat.msg,
    });
  }

  private extractToken(socket: Socket): string {
    // 1. Buscar en handshake.auth
    const fromAuth = socket.handshake.auth?.token;
    if (typeof fromAuth === "string" && fromAuth.length > 0) return fromAuth;

    // 2. Buscar en headers.authorization
    const header = socket.handshake.headers.authorization;
    if (typeof header === "string" && header.startsWith("Bearer ")) {
      return header.slice("Bearer ".length);
    }

    // 3. Buscar en query parameters (usado por el cliente de Angular)
    const fromQuery = socket.handshake.query?.token;
    if (typeof fromQuery === "string" && fromQuery.length > 0) return fromQuery;

    throw new Error("missing token");
  }
}
