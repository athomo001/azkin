// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { diffFields } from "../../services/diff-fields";
import { EmailTakenError, NotFoundError } from "../../../domain/errors/domain-error";
import { IUser } from "../../../domain/entities/user";

export interface UpdateAdminInput {
  actorId: string;
  id: string;
  email: string;
}

/**
 * Caso de uso para que un Admin autenticado edite el email de otra cuenta Admin.
 */
export class UpdateAdminUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: UpdateAdminInput): Promise<IUser> {
    const existing = await this.users.findByEmail(input.email);
    if (existing && existing.id !== input.id) {
      throw new EmailTakenError();
    }

    const before = await this.users.findById(input.id);

    const updated = await this.users.updateAdminEmail(input.id, input.email);
    if (!updated) {
      throw new NotFoundError("Administrador no encontrado");
    }

    await this.auditLog.record({
      actorId: input.actorId,
      action: "ADMIN_UPDATE",
      targetType: "user",
      targetIds: [input.id],
      metadata: { changes: diffFields((before as unknown as Record<string, unknown>) ?? {}, { email: input.email }) },
    });

    return updated;
  }
}
