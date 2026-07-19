// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import jwt from "jsonwebtoken";
import { ITokenService } from "../../application/ports/services/security";
import { UnauthorizedError } from "../../domain/errors/domain-error";
import { IUserPermission } from "../../domain/entities/user";

interface AzkinJwtPayload extends jwt.JwtPayload {
  adminId?: string;
  permissions?: IUserPermission[];
}

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresInSeconds: number,
  ) {}

  sign(userId: string, role: string, adminId?: string, permissions?: IUserPermission[], expiresInSecondsOverride?: number): string {
    const expiresIn = expiresInSecondsOverride ?? this.expiresInSeconds;
    return jwt.sign({ sub: userId, role, adminId, permissions }, this.secret, { expiresIn });
  }

  verify(token: string): { userId: string; role: string; adminId?: string; permissions?: IUserPermission[] } {
    try {
      const payload = jwt.verify(token, this.secret) as AzkinJwtPayload;
      if (!payload.sub || typeof payload.sub !== "string" || !payload.role || typeof payload.role !== "string") {
        throw new UnauthorizedError("Token no válido o corrupto");
      }
      return {
        userId: payload.sub,
        role: payload.role,
        adminId: payload.adminId,
        permissions: payload.permissions,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError("Token inválido o expirado");
    }
  }
}
