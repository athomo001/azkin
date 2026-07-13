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
        const { userId } = this.tokens.verify(token);
        socket.data.userId = userId;
        void socket.join(userId);
        next();
      } catch {
        next(new Error("unauthorized"));
      }
    });

    this.io.on("connection", (socket) => {
      const userId = socket.data.userId as string;
      logger.info(`Socket connected for user ${userId}`);
    });
  }

  publishHeartbeat(userId: string, beat: IHeartbeat): void {
    this.io.to(userId).emit("heartbeat", {
      monitorId: beat.monitorId,
      timestamp: beat.timestamp.toISOString(),
      status: beat.status,
      ping: beat.ping,
      msg: beat.msg,
    });
  }

  private extractToken(socket: Socket): string {
    const fromAuth = socket.handshake.auth?.token;
    if (typeof fromAuth === "string" && fromAuth.length > 0) return fromAuth;

    const header = socket.handshake.headers.authorization;
    if (typeof header === "string" && header.startsWith("Bearer ")) {
      return header.slice("Bearer ".length);
    }
    throw new Error("missing token");
  }
}
