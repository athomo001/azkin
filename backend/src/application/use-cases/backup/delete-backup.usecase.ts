// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IBackupRepository } from "../../ports/repositories/backup-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para eliminar un respaldo guardado puntual (sin afectar a los demás).
 */
export class DeleteBackupUseCase {
  constructor(
    private readonly backups: IBackupRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, backupId: string): Promise<void> {
    const deleted = await this.backups.deleteById(backupId);
    if (!deleted) {
      throw new NotFoundError("Respaldo no encontrado");
    }

    await this.auditLog.record({
      actorId,
      action: "BACKUP_DELETE",
      targetType: "backup",
      targetIds: [backupId],
    });
  }
}
