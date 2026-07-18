// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { ValidationError } from "../../../domain/errors/domain-error";

/** Valida y NORMALIZA req.body con un schema Zod (fail-fast en el borde). */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ValidationError("Validation failed", result.error.issues));
    }
    req.body = result.data;
    next();
  };
}
