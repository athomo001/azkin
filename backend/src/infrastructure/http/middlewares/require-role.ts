// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../../../domain/errors/domain-error";

/**
 * Middleware de autorización por rol. Debe montarse siempre después de authGuard,
 * que es quien puebla req.userRole a partir del JWT.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return next(new ForbiddenError());
    }
    next();
  };
}
