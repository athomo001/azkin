// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { CreateBackupUseCase } from "../../../application/use-cases/backup/create-backup.usecase";
import { ListBackupsUseCase } from "../../../application/use-cases/backup/list-backups.usecase";
import { GetBackupUseCase } from "../../../application/use-cases/backup/get-backup.usecase";
import { ImportBackupUseCase } from "../../../application/use-cases/backup/import-backup.usecase";
import { PurgeInstanceUseCase } from "../../../application/use-cases/backup/purge-instance.usecase";
import { GetPurgePreviewUseCase } from "../../../application/use-cases/backup/get-purge-preview.usecase";
import { DeleteBackupUseCase } from "../../../application/use-cases/backup/delete-backup.usecase";

export class BackupController {
  constructor(
    private readonly createUseCase: CreateBackupUseCase,
    private readonly listUseCase: ListBackupsUseCase,
    private readonly getUseCase: GetBackupUseCase,
    private readonly importUseCase: ImportBackupUseCase,
    private readonly purgeUseCase: PurgeInstanceUseCase,
    private readonly purgePreviewUseCase: GetPurgePreviewUseCase,
    private readonly deleteUseCase: DeleteBackupUseCase,
    private readonly firstAdminEmail: string | undefined,
    private readonly firstAdminName: string | undefined,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const userId = req.adminId!;
    const strategy = req.body.strategy === "replace" ? "replace" : "accumulate";
    const result = await this.createUseCase.execute({ userId, strategy });
    res.status(201).json({
      id: result.backup.id,
      strategy: result.backup.strategy,
      createdAt: result.backup.createdAt,
      deletedCount: result.deletedCount,
      payload: result.backup.payload,
    });
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const backups = await this.listUseCase.execute();
    res.status(200).json(backups.map((b) => ({ id: b.id, strategy: b.strategy, createdAt: b.createdAt })));
  };

  download = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const backup = await this.getUseCase.execute(req.adminId!, id);
    res.status(200).json(backup.payload);
  };

  import = async (req: Request, res: Response): Promise<void> => {
    const userId = req.adminId!;
    const result = await this.importUseCase.execute({
      userId,
      monitors: req.body.monitors,
      notifications: req.body.notifications,
      admins: req.body.admins,
      viewers: req.body.viewers,
      tlsConfig: req.body.tlsConfig,
    });
    res.status(200).json(result);
  };

  purge = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.purgeUseCase.execute({
      firstAdminEmail: this.firstAdminEmail,
      firstAdminName: this.firstAdminName,
    });
    res.status(200).json(result);
  };

  purgePreview = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.purgePreviewUseCase.execute({
      firstAdminEmail: this.firstAdminEmail,
      firstAdminName: this.firstAdminName,
    });
    res.status(200).json(result);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await this.deleteUseCase.execute(req.adminId!, id);
    res.status(204).send();
  };
}
