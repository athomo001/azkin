// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import jwt from "jsonwebtoken";
import { ITokenService, TokenType } from "../../application/ports/services/security";
import { UnauthorizedError } from "../../domain/errors/domain-error";
import { IUserPermission } from "../../domain/entities/user";

interface AzkinJwtPayload extends jwt.JwtPayload {
  adminId?: string;
  permissions?: IUserPermission[];
  typ?: TokenType;
}

const JWT_ALGORITHM = "HS256" as const;

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresInSeconds: number,
  ) {}

  sign(
    userId: string,
    role: string,
    type: TokenType,
    adminId?: string,
    permissions?: IUserPermission[],
    expiresInSecondsOverride?: number,
  ): string {
    const expiresIn = expiresInSecondsOverride ?? this.expiresInSeconds;
    return jwt.sign({ sub: userId, role, adminId, permissions, typ: type }, this.secret, {
      expiresIn,
      algorithm: JWT_ALGORITHM,
    });
  }

  verify(
    token: string,
    expectedType?: TokenType,
  ): { userId: string; role: string; adminId?: string; permissions?: IUserPermission[] } {
    try {
      const payload = jwt.verify(token, this.secret, { algorithms: [JWT_ALGORITHM] }) as AzkinJwtPayload;
      if (!payload.sub || typeof payload.sub !== "string" || !payload.role || typeof payload.role !== "string") {
        throw new UnauthorizedError("Token no válido o corrupto");
      }
      if (expectedType && payload.typ !== expectedType) {
        throw new UnauthorizedError("Tipo de token no válido para esta operación");
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
