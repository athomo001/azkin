// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import "express";
import { IUserPermission } from "../domain/entities/user";

declare global {
  namespace Express {
    interface Request {
      /** Inyectado por authGuard tras verificar el JWT. */
      userId?: string;
      userRole?: string;
      adminId?: string;
      permissions?: IUserPermission[];
    }
  }
}
