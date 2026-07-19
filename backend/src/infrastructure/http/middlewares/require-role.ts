// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../../../domain/errors/domain-error";
import { UserRole } from "../../../domain/entities/user";

/**
 * Middleware de autorización por rol. Debe montarse siempre después de authGuard,
 * que es quien puebla req.userRole a partir del JWT.
 * Tipado con `UserRole[]` (no `string[]`) para que un typo en el nombre del rol
 * (ej. `requireRole("admn")`) sea un error de compilación en vez de un bloqueo silencioso.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // req.userRole llega como string desde el JWT decodificado (auth-guard.ts); se acota a
    // UserRole en este único punto de confianza, ya verificado no-vacío en la línea anterior.
    if (!req.userRole || !allowedRoles.includes(req.userRole as UserRole)) {
      return next(new ForbiddenError());
    }
    next();
  };
}
