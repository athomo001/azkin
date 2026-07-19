// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import tls from "tls";
import { X509Certificate } from "crypto";
import { ITlsConfigRepository } from "../../ports/repositories/tls-config-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { ITlsServerManager } from "../../ports/services/tls-server-manager";
import { ITlsConfig } from "../../../domain/entities/tls-config";
import { ValidationError } from "../../../domain/errors/domain-error";
import { getErrorMessage } from "../../services/get-error-message";

export interface ApplyTlsConfigInput {
  actorId: string;
  certPem: string;
  keyPem: string;
  chainPem?: string;
  port: number;
  httpRedirect: boolean;
}

export interface ApplyTlsConfigOutput {
  config: ITlsConfig;
}

/**
 * Caso de uso para validar y aplicar una nueva configuración TLS/HTTPS.
 * Valida formato y vigencia del certificado, valida el par cert/clave, persiste (clave cifrada
 * en reposo) y recarga el listener HTTPS solo si todo lo anterior fue exitoso.
 */
export class ApplyTlsConfigUseCase {
  constructor(
    private readonly tlsConfigs: ITlsConfigRepository,
    private readonly auditLog: IAuditLogRepository,
    private readonly tlsServerManager: ITlsServerManager,
    private readonly encryptPrivateKey: (pem: string, key: string) => string,
    private readonly encryptionKey: string,
  ) {}

  async execute(input: ApplyTlsConfigInput): Promise<ApplyTlsConfigOutput> {
    let cert: X509Certificate;
    try {
      cert = new X509Certificate(input.certPem);
    } catch {
      throw new ValidationError("El certificado no tiene un formato PEM válido");
    }

    if (new Date(cert.validTo).getTime() < Date.now()) {
      throw new ValidationError(`El certificado está vencido (venció el ${cert.validTo})`);
    }

    try {
      // tls.createSecureContext valida que el certificado y la clave privada correspondan entre sí.
      tls.createSecureContext({ cert: input.certPem, key: input.keyPem, ca: input.chainPem });
    } catch (err) {
      throw new ValidationError(`Certificado o clave privada inválidos: ${getErrorMessage(err)}`);
    }

    let applyError: string | undefined;
    try {
      await this.tlsServerManager.reload({
        certPem: input.certPem,
        keyPem: input.keyPem,
        chainPem: input.chainPem,
        port: input.port,
        httpRedirect: input.httpRedirect,
      });
    } catch (err) {
      applyError = getErrorMessage(err);
    }

    await this.auditLog.record({
      actorId: input.actorId,
      action: "TLS_CONFIG_UPDATE",
      targetType: "tls-config",
      metadata: {
        port: input.port,
        httpRedirect: input.httpRedirect,
        fingerprint: cert.fingerprint256,
        validTo: cert.validTo,
        success: !applyError,
        error: applyError,
      },
    });

    if (applyError) {
      throw new ValidationError(
        `No se pudo levantar el listener HTTPS en el puerto ${input.port}: ${applyError}. El servicio anterior sigue activo.`,
      );
    }

    // Solo se persiste tras confirmar que el listener HTTPS arrancó correctamente.
    const keyPemEncrypted = this.encryptPrivateKey(input.keyPem, this.encryptionKey);
    const config = await this.tlsConfigs.upsert({
      certPem: input.certPem,
      keyPemEncrypted,
      chainPem: input.chainPem,
      port: input.port,
      httpRedirect: input.httpRedirect,
      updatedById: input.actorId,
    });

    return { config };
  }
}
