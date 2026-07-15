import { NextFunction, Request, Response } from "express";
import { ITokenService } from "../../../application/ports/services/security";
import { UnauthorizedError } from "../../../domain/errors/domain-error";

/** Extrae y verifica el JWT; inyecta req.userId. Nunca confía en datos del cliente. */
export function makeAuthGuard(tokens: ITokenService) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Missing bearer token"));
    }
    const token = header.slice("Bearer ".length);
    try {
      const { userId } = tokens.verify(token);
      req.userId = userId;
      next();
    } catch (error) {
      next(error);
    }
  };
}
