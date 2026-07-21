// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";
import { IApiKeyRepository } from "../../ports/repositories/api-key-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { ApiKeyScope } from "../../../domain/entities/api-key";

export interface CreateApiKeyInput {
  adminId: string;
  name: string;
  scopes: ApiKeyScope[];
}

export interface CreateApiKeyOutput {
  id: string;
  name: string;
  scopes: ApiKeyScope[];
  keyPrefix: string;
  createdAt: Date;
  /** Valor en texto plano — se devuelve una única vez, nunca vuelve a estar disponible. */
  plainKey: string;
}

/**
 * Caso de uso para generar una nueva API Key de la API pública.
 * Solo se persiste el hash SHA-256; el valor en claro se devuelve una única vez al Admin.
 */
export class CreateApiKeyUseCase {
  constructor(
    private readonly apiKeys: IApiKeyRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: CreateApiKeyInput): Promise<CreateApiKeyOutput> {
    const plainKey = `azk_${crypto.randomBytes(32).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(plainKey).digest("hex");
    const keyPrefix = plainKey.slice(0, 12);

    const created = await this.apiKeys.create({
      adminId: input.adminId,
      name: input.name,
      keyHash,
      keyPrefix,
      scopes: input.scopes.length > 0 ? input.scopes : ["read"],
    });

    await this.auditLog.record({
      actorId: input.adminId,
      action: "API_KEY_CREATE",
      targetType: "api-key",
      targetIds: [created.id],
      metadata: { name: created.name, scopes: created.scopes },
    });

    return {
      id: created.id,
      name: created.name,
      scopes: created.scopes,
      keyPrefix: created.keyPrefix,
      createdAt: created.createdAt,
      plainKey,
    };
  }
}
