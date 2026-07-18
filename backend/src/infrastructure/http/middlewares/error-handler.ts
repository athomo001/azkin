// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { NextFunction, Request, Response } from "express";
import { DomainError, ValidationError } from "../../../domain/errors/domain-error";
import { logger } from "../../logger";

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

/**
 * Middleware centralizado de Express para el manejo de errores.
 * Intercepta excepciones de tipo DomainError y formatea la respuesta en un envelope estandarizado.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof DomainError) {
    const body: ErrorBody = { error: { code: err.code, message: err.message } };
    if (err instanceof ValidationError && err.details !== undefined) {
      body.error.details = err.details;
    }
    res.status(err.httpStatus).json(body);
    return;
  }

  logger.error("Error no controlado capturado por el middleware", err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" },
  });
}
