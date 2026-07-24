// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederationClient } from "../../ports/services/federation-client";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { getErrorMessage } from "../../services/get-error-message";
import { logger } from "../../../infrastructure/logger";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { QuotaExceededError, ValidationError } from "../../../domain/errors/domain-error";
import { MAX_FEDERATED_INSTANCES } from "./federation-limits";

export interface JoinFederationInput {
  actorId: string;
  /** Código pegado por el Admin, generado por `CreateEnrollmentTokenUseCase` en la otra instancia. */
  code: string;
  /** Cómo esta instancia va a referirse al par nuevo (ej. "China-VPS1"). */
  peerLabel: string;
  /** Cómo esta instancia se identifica a sí misma frente al par. */
  ownLabel: string;
}

export interface JoinFederationOutput {
  instance: IFederatedInstance;
}

/**
 * Lado que **inicia** el enrollment (AZ-049): decodifica el código pegado por el Admin, genera un
 * secreto compartido nuevo para este par, llama de salida a la instancia remota con el token y el
 * secreto, y si acepta, persiste el registro simétrico local con el secreto cifrado en reposo.
 * Caso borde aceptado (no se resuelve con 2PC — sería sobreingeniería a 5 instancias máximo): si
 * la red falla justo después de que la remota acepta pero antes de recibir la respuesta, la
 * remota queda con un registro "huérfano" que se resuelve revocándolo manualmente.
 */
export class JoinFederationUseCase {
  constructor(
    private readonly federatedInstances: IFederatedInstanceRepository,
    private readonly client: IFederationClient,
    private readonly auditLog: IAuditLogRepository,
    private readonly resolveOwnUrl: () => Promise<string | null>,
    private readonly encryptSecret: (secret: string, key: string) => string,
    private readonly encryptionKey: string,
  ) {}

  async execute(input: JoinFederationInput): Promise<JoinFederationOutput> {
    const activeCount = await this.federatedInstances.countActive();
    if (activeCount >= MAX_FEDERATED_INSTANCES) {
      throw new QuotaExceededError(
        `Se ha superado el límite máximo de ${MAX_FEDERATED_INSTANCES} instancias federadas`,
      );
    }

    const ownUrl = await this.resolveOwnUrl();
    if (!ownUrl) {
      throw new ValidationError(
        "Configura la dirección pública de esta instancia en /settings → Multi-Región antes de unirte a una federación",
      );
    }

    const decoded = this.decodeCode(input.code);
    const secret = crypto.randomBytes(32).toString("hex");
    const effectivePeerLabel = input.peerLabel?.trim() || decoded.label;

    await this.client.requestEnrollment({
      remoteUrl: decoded.url,
      token: decoded.token,
      callerLabel: input.ownLabel?.trim() || ownUrl,
      callerUrl: ownUrl,
      callerSecret: secret,
    });

    const instance = await this.federatedInstances.create({
      label: effectivePeerLabel,
      remoteUrl: decoded.url,
      remoteSecretEncrypted: this.encryptSecret(secret, this.encryptionKey),
      createdById: input.actorId,
      status: "enrolled",
    });

    await this.auditLog.record({
      actorId: input.actorId,
      action: "FEDERATION_INSTANCE_ENROLLED",
      targetType: "federated-instance",
      targetIds: [instance.id],
    });

    if (this.onEnrolledCallback) {
      this.onEnrolledCallback(instance.id, input.actorId).catch((err) => {
        logger.error(`[Federation] Fallo en auto-vinculación en segundo plano tras unirse: ${getErrorMessage(err)}`);
      });
    }

    return { instance };
  }

  private onEnrolledCallback?: (instanceId: string, createdById: string) => Promise<void>;

  setOnEnrolledCallback(fn: (instanceId: string, createdById: string) => Promise<void>): void {
    this.onEnrolledCallback = fn;
  }

  private decodeCode(code: string): { url: string; token: string; label: string } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(Buffer.from(code, "base64url").toString("utf8"));
    } catch (err) {
      throw new ValidationError(`El código de enrollment no tiene un formato válido: ${getErrorMessage(err)}`);
    }

    const { url, token, label } = (parsed ?? {}) as { url?: unknown; token?: unknown; label?: unknown };
    if (typeof url !== "string" || typeof token !== "string" || !url || !token) {
      throw new ValidationError("El código de enrollment no tiene un formato válido");
    }

    return { url, token, label: typeof label === "string" && label ? label : url };
  }
}
