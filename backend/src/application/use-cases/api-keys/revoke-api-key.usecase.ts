// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IApiKeyRepository } from "../../ports/repositories/api-key-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para revocar una API Key. Una vez revocada, deja de autenticar
 * peticiones contra la API pública inmediatamente.
 */
export class RevokeApiKeyUseCase {
  constructor(private readonly apiKeys: IApiKeyRepository) {}

  async execute(adminId: string, id: string): Promise<void> {
    const revoked = await this.apiKeys.revoke(adminId, id);
    if (!revoked) {
      throw new NotFoundError("API Key no encontrada");
    }
  }
}
