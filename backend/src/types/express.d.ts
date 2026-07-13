import "express";

declare global {
  namespace Express {
    interface Request {
      /** Inyectado por authGuard tras verificar el JWT. */
      userId?: string;
    }
  }
}
