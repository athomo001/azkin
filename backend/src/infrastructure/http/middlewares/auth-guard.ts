// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { NextFunction, Request, Response } from "express";
import { ITokenService } from "../../../application/ports/services/security";
import { IUserRepository } from "../../../application/ports/repositories/user-repository";
import { UnauthorizedError } from "../../../domain/errors/domain-error";

/**
 * Middleware para extraer, verificar e inyectar el contexto de seguridad del token JWT en la petición.
 * Sostiene los claims userId, userRole y adminId en req.
 *
 * AZ-054: además de validar la firma/expiración del JWT, confirma contra la base de datos que la
 * cuenta sigue existiendo y no está bloqueada — sin esto, bloquear/eliminar un usuario no cortaba
 * el acceso hasta que su token expirara solo (hasta 1 año en sesiones TV/Kiosko).
 */
export function makeAuthGuard(tokens: ITokenService, users: IUserRepository) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Falta token / inválido / expirado"));
    }
    const token = header.slice("Bearer ".length);
    try {
      const { userId, role, adminId, permissions } = tokens.verify(token, "access");
      const user = await users.findById(userId);
      if (!user || user.isBlocked) {
        return next(new UnauthorizedError("Cuenta bloqueada o eliminada"));
      }
      req.userId = userId;
      req.userRole = role;
      req.adminId = adminId ?? userId; // Si no tiene adminId, el owner es sí mismo
      req.permissions = permissions ?? [];
      next();
    } catch (error) {
      next(error);
    }
  };
}
