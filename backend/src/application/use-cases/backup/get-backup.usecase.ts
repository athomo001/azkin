// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IBackupRepository } from "../../ports/repositories/backup-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IBackup } from "../../../domain/entities/backup";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para obtener el payload completo de un respaldo específico (descarga).
 * El payload incluye password hashes de todas las cuentas y la config TLS — se audita porque
 * es una lectura tan sensible como cualquier escritura.
 */
export class GetBackupUseCase {
  constructor(
    private readonly backups: IBackupRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, id: string): Promise<IBackup> {
    const backup = await this.backups.findById(id);
    if (!backup) {
      throw new NotFoundError("Respaldo no encontrado");
    }

    await this.auditLog.record({
      actorId,
      action: "BACKUP_DOWNLOAD",
      targetType: "backup",
      targetIds: [id],
    });

    return backup;
  }
}
