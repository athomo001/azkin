// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { NextFunction, Request, Response } from "express";
import { ITokenService } from "../../../application/ports/services/security";
import { UnauthorizedError } from "../../../domain/errors/domain-error";

/**
 * Middleware para extraer, verificar e inyectar el contexto de seguridad del token JWT en la petición.
 * Sostiene los claims userId, userRole y adminId en req.
 */
export function makeAuthGuard(tokens: ITokenService) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Falta token / inválido / expirado"));
    }
    const token = header.slice("Bearer ".length);
    try {
      const { userId, role, adminId, permissions } = tokens.verify(token);
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
