/**
 * Error de dominio: expone un `code` estable y su equivalente HTTP.
 * El `errorHandler` de la capa HTTP lo traduce al envelope de error de la API.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  readonly code = "VALIDATION_ERROR";
  readonly httpStatus = 400;

  constructor(
    message = "Validation failed",
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = "UNAUTHORIZED";
  readonly httpStatus = 401;

  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly code = "INVALID_CREDENTIALS";
  readonly httpStatus = 401;

  constructor(message = "Invalid email or password") {
    super(message);
  }
}

export class EmailTakenError extends DomainError {
  readonly code = "EMAIL_TAKEN";
  readonly httpStatus = 409;

  constructor(message = "Email already registered") {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND";
  readonly httpStatus = 404;

  constructor(message = "Resource not found") {
    super(message);
  }
}

export class QuotaExceededError extends DomainError {
  readonly code = "VALIDATION_ERROR";
  readonly httpStatus = 400;

  constructor(message = "Se ha superado el límite máximo de 50 monitores por cuenta") {
    super(message);
  }
}
