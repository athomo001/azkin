// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";

export interface GetPurgePreviewInput {
  firstAdminEmail?: string;
  firstAdminName?: string;
}

export interface GetPurgePreviewOutput {
  configured: boolean;
  keepIdentifier?: string;
  keepAdminExists: boolean;
}

/**
 * Resuelve, SIN borrar nada, a qué admin conservaría "Purgar instancia" — para que la UI pueda
 * mostrárselo al usuario antes de que confirme una acción irreversible (misma resolución de
 * identidad que PurgeInstanceUseCase, pero de solo lectura).
 */
export class GetPurgePreviewUseCase {
  constructor(private readonly users: IUserRepository) {}

  async execute(input: GetPurgePreviewInput): Promise<GetPurgePreviewOutput> {
    const identifier = input.firstAdminEmail ?? input.firstAdminName;
    if (!identifier) {
      return { configured: false, keepAdminExists: false };
    }
    const admin = await this.users.findByIdentifier(identifier);
    return {
      configured: true,
      keepIdentifier: identifier,
      keepAdminExists: !!admin && admin.role === "admin",
    };
  }
}
