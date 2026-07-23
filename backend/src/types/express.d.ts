// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import "express";
import { IUserPermission } from "../domain/entities/user";
import { IFederatedInstance } from "../domain/entities/federated-instance";

declare global {
  namespace Express {
    interface Request {
      /** Inyectado por authGuard tras verificar el JWT. */
      userId?: string;
      userRole?: string;
      adminId?: string;
      permissions?: IUserPermission[];
      /** Inyectado por verify-peer-certificate.ts tras validar la huella del cliente mTLS. */
      federatedInstance?: IFederatedInstance;
    }
  }
}
