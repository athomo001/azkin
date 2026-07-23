// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { IFederatedInstanceRepository } from "../../../application/ports/repositories/federated-instance-repository";
import { UnauthorizedError } from "../../../domain/errors/domain-error";

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Middleware de autenticación entre pares de federación: lee el header `X-Federation-Secret` y lo
 * compara contra el secreto compartido (descifrado) de cada instancia federada activa. Máximo 5
 * pares por decisión de alcance (ver ISSUES.md AZ-049), así que descifrar y comparar cada una en
 * memoria en cada pedido es más simple que mantener un índice — y, a diferencia de un hash, hace
 * falta poder recuperar el secreto en texto plano porque este mismo backend también lo presenta
 * cuando es él quien inicia el sondeo hacia el par (el sondeo es bidireccional).
 */
export function makeVerifyPeerSecret(
  federatedInstances: IFederatedInstanceRepository,
  decryptSecret: (encrypted: string, key: string) => string,
  encryptionKey: string,
) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const raw = req.headers["x-federation-secret"];
    const secret = Array.isArray(raw) ? raw[0] : raw;
    if (!secret) {
      return next(new UnauthorizedError("Falta el header X-Federation-Secret"));
    }

    try {
      const active = await federatedInstances.findAllActive();
      const match = active.find((instance) => {
        try {
          return secureCompare(decryptSecret(instance.remoteSecretEncrypted, encryptionKey), secret);
        } catch {
          return false;
        }
      });

      if (!match) {
        return next(new UnauthorizedError("Instancia no federada o federación revocada"));
      }

      req.federatedInstance = match;
      next();
    } catch (error) {
      next(error);
    }
  };
}
