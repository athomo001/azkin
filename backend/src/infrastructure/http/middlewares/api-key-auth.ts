// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { IApiKeyRepository } from "../../../application/ports/repositories/api-key-repository";
import { UnauthorizedError, ForbiddenError } from "../../../domain/errors/domain-error";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Middleware de autenticación alternativa para la API pública: lee el header
 * X-API-Key en vez del JWT de sesión, y puebla el mismo contexto de request (userId,
 * userRole, adminId, permissions) que authGuard, para que los controllers/use-cases
 * existentes no necesiten distinguir el origen de la petición.
 */
export function makeApiKeyAuth(apiKeys: IApiKeyRepository) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const rawKey = req.headers["x-api-key"];
    const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;
    if (!key) {
      return next(new UnauthorizedError("Falta el header X-API-Key"));
    }

    try {
      const keyHash = crypto.createHash("sha256").update(key).digest("hex");
      const apiKey = await apiKeys.findByHash(keyHash);
      if (!apiKey) {
        return next(new UnauthorizedError("API Key inválida o revocada"));
      }

      const requiredScope = WRITE_METHODS.has(req.method) ? "write" : "read";
      if (!apiKey.scopes.includes(requiredScope)) {
        return next(new ForbiddenError(`Esta API Key no tiene permiso de '${requiredScope}'`));
      }

      req.userId = apiKey.adminId;
      req.userRole = "admin";
      req.adminId = apiKey.adminId;
      req.permissions = [];

      void apiKeys.touchLastUsed(apiKey.id);

      next();
    } catch (error) {
      next(error);
    }
  };
}
