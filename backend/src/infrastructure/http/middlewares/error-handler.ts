import { NextFunction, Request, Response } from "express";
import { DomainError, ValidationError } from "../../../domain/errors/domain-error";
import { logger } from "../../logger";

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

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

  logger.error("Unhandled error", err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
}
