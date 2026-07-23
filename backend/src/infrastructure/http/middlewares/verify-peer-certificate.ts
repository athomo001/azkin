// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { NextFunction, Request, Response } from "express";
import { X509Certificate } from "crypto";
import { TLSSocket } from "tls";
import { IFederatedInstanceRepository } from "../../../application/ports/repositories/federated-instance-repository";
import { UnauthorizedError } from "../../../domain/errors/domain-error";

/**
 * Middleware exclusivo del listener mTLS de federación: valida que el certificado de cliente
 * presentado en el handshake TLS corresponda a la huella de una instancia enrolada (no revocada).
 * La comprobación se hace en Mongo en cada request (no solo a nivel de TLS/CA) — es lo que hace
 * que revocar una federación tenga efecto inmediato incluso sobre conexiones ya abiertas.
 */
export function makeVerifyPeerCertificate(federatedInstances: IFederatedInstanceRepository) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const socket = req.socket as TLSSocket;
    const peerCert = typeof socket.getPeerCertificate === "function" ? socket.getPeerCertificate() : undefined;
    if (!peerCert || !peerCert.raw) {
      return next(new UnauthorizedError("Certificado de cliente ausente o inválido"));
    }

    let fingerprint: string;
    try {
      const pem = `-----BEGIN CERTIFICATE-----\n${peerCert.raw.toString("base64").match(/.{1,64}/g)!.join("\n")}\n-----END CERTIFICATE-----`;
      fingerprint = new X509Certificate(pem).fingerprint256;
    } catch {
      return next(new UnauthorizedError("Certificado de cliente con formato inválido"));
    }

    const instance = await federatedInstances.findEnrolledByFingerprint(fingerprint);
    if (!instance) {
      return next(new UnauthorizedError("Instancia no federada o federación revocada"));
    }

    req.federatedInstance = instance;
    next();
  };
}
