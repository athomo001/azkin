// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import "express";

declare global {
  namespace Express {
    interface Request {
      /** Inyectado por authGuard tras verificar el JWT. */
      userId?: string;
      userRole?: string;
      adminId?: string;
      permissions?: { type: string; value?: string }[];
    }
  }
}
