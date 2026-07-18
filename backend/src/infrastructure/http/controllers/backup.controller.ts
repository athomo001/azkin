// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { CreateBackupUseCase } from "../../../application/use-cases/backup/create-backup.usecase";
import { ListBackupsUseCase } from "../../../application/use-cases/backup/list-backups.usecase";
import { GetBackupUseCase } from "../../../application/use-cases/backup/get-backup.usecase";
import { ImportBackupUseCase } from "../../../application/use-cases/backup/import-backup.usecase";

export class BackupController {
  constructor(
    private readonly createUseCase: CreateBackupUseCase,
    private readonly listUseCase: ListBackupsUseCase,
    private readonly getUseCase: GetBackupUseCase,
    private readonly importUseCase: ImportBackupUseCase,
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

  list = async (req: Request, res: Response): Promise<void> => {
    const userId = req.adminId!;
    const backups = await this.listUseCase.execute(userId);
    res.status(200).json(backups.map((b) => ({ id: b.id, strategy: b.strategy, createdAt: b.createdAt })));
  };

  download = async (req: Request, res: Response): Promise<void> => {
    const userId = req.adminId!;
    const id = req.params.id as string;
    const backup = await this.getUseCase.execute(userId, id);
    res.status(200).json(backup.payload);
  };

  import = async (req: Request, res: Response): Promise<void> => {
    const userId = req.adminId!;
    const result = await this.importUseCase.execute({
      userId,
      monitors: req.body.monitors,
    });
    res.status(200).json(result);
  };
}
