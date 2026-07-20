// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IApiKeyRepository } from "../../ports/repositories/api-key-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para eliminar permanentemente una API Key (a diferencia de RevokeApiKeyUseCase,
 * que solo la invalida marcando `revokedAt`, esta la borra del todo — activa o ya revocada).
 */
export class DeleteApiKeyUseCase {
  constructor(
    private readonly apiKeys: IApiKeyRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(adminId: string, id: string): Promise<void> {
    const deleted = await this.apiKeys.delete(adminId, id);
    if (!deleted) {
      throw new NotFoundError("API Key no encontrada");
    }

    await this.auditLog.record({
      actorId: adminId,
      action: "API_KEY_DELETE",
      targetType: "api-key",
      targetIds: [id],
    });
  }
}
