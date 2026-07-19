// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IApiKeyRepository } from "../../ports/repositories/api-key-repository";
import { IApiKey } from "../../../domain/entities/api-key";

/**
 * Caso de uso para listar las API Keys de un Admin. Nunca expone el valor en claro
 * ni el hash — solo `keyPrefix` para que el Admin identifique cuál es cuál.
 */
export class ListApiKeysUseCase {
  constructor(private readonly apiKeys: IApiKeyRepository) {}

  async execute(adminId: string): Promise<IApiKey[]> {
    return this.apiKeys.findAllByAdmin(adminId);
  }
}
