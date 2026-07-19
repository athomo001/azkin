// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IBackupRepository } from "../../ports/repositories/backup-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { BackupStrategy, IBackup } from "../../../domain/entities/backup";

export interface CreateBackupInput {
  userId: string;
  strategy: BackupStrategy;
}

export interface CreateBackupOutput {
  backup: IBackup;
  deletedCount: number;
}

/**
 * Caso de uso para generar un respaldo persistido de la configuración de monitores.
 * En modo "replace", borra atómicamente los respaldos previos del usuario antes de insertar el nuevo.
 */
export class CreateBackupUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly backups: IBackupRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: CreateBackupInput): Promise<CreateBackupOutput> {
    const list = await this.monitors.findAll();
    const mapped = list.map((m) => {
      const { id, userId: _userId, createdAt, updatedAt, ...rest } = m;
      return rest;
    });

    let deletedCount = 0;
    if (input.strategy === "replace") {
      deletedCount = await this.backups.deleteAll();
    }

    const backup = await this.backups.create({
      userId: input.userId,
      strategy: input.strategy,
      payload: {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        monitors: mapped,
      },
    });

    if (input.strategy === "replace") {
      await this.auditLog.record({
        actorId: input.userId,
        action: "BACKUP_REPLACE",
        targetType: "backup",
        metadata: { deletedCount },
      });
    }

    return { backup, deletedCount };
  }
}
